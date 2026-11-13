import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";
import type { NotificationType } from "@/generated/prisma/client";

/**
 * Cross-cutting service helpers: activity feed, notifications, audit trail
 * and idempotent mutations. Every module reuses these so the behaviour is
 * consistent (and testable) across the API surface.
 */

type Tx = Prisma.TransactionClient;

export async function recordActivity(
  userId: string,
  type: string,
  title: string,
  opts: { subjectType?: string; subjectId?: string; meta?: Prisma.InputJsonValue } = {},
  db: Tx = getDb(),
): Promise<void> {
  await db.activityEvent.create({
    data: {
      userId,
      type,
      title,
      subjectType: opts.subjectType,
      subjectId: opts.subjectId,
      meta: opts.meta,
    },
  });
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  opts: { body?: string; link?: string; data?: Prisma.InputJsonValue } = {},
  db: Tx = getDb(),
): Promise<void> {
  await db.notification.create({
    data: {
      userId,
      type,
      title,
      body: opts.body,
      link: opts.link,
      data: opts.data,
    },
  });
}

export interface AuditInput {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}

export async function recordAudit(input: AuditInput, db: Tx = getDb()): Promise<void> {
  await db.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      requestId: input.requestId,
      ip: input.ip,
      userAgent: input.userAgent?.slice(0, 400),
      metadata: input.metadata,
    },
  });
}

export interface IdempotentOutcome<T> {
  result: T;
  replayed: boolean;
}

/**
 * Run a mutation at most once per idempotency key.
 *
 * - First call inserts an IN_PROGRESS row (the primary key makes racing
 *   duplicates fail fast), runs the mutation, then marks it COMPLETED with
 *   the response body.
 * - Concurrent duplicates receive CONFLICT (409).
 * - Later replays return the stored response without re-running.
 */
export async function withIdempotency<T>(
  key: string,
  userId: string | null,
  fn: () => Promise<T>,
  opts: { ttlSeconds?: number; db?: Tx } = {},
): Promise<IdempotentOutcome<T>> {
  const db = opts.db ?? getDb();
  const ttl = opts.ttlSeconds ?? 24 * 60 * 60;

  const existing = await db.idempotencyRecord.findUnique({ where: { key } });
  if (existing) {
    if (existing.status === "COMPLETED") {
      return { result: (existing.responseBody as T) ?? (null as T), replayed: true };
    }
    // IN_PROGRESS and older than a minute → treat as stale and take over.
    const stale = existing.createdAt.getTime() < Date.now() - 60_000;
    if (!stale) {
      const { AppError } = await import("@/lib/errors/app-error");
      throw new AppError("CONFLICT", "An identical request is already being processed.");
    }
    await db.idempotencyRecord.update({
      where: { key },
      data: { status: "IN_PROGRESS", createdAt: new Date() },
    });
  } else {
    try {
      await db.idempotencyRecord.create({
        data: { key, userId, status: "IN_PROGRESS", expiresAt: new Date(Date.now() + ttl * 1000) },
      });
    } catch {
      const { AppError } = await import("@/lib/errors/app-error");
      throw new AppError("CONFLICT", "An identical request is already being processed.");
    }
  }

  try {
    const result = await fn();
    await db.idempotencyRecord.update({
      where: { key },
      data: { status: "COMPLETED", responseBody: JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue },
    });
    return { result, replayed: false };
  } catch (error) {
    await db.idempotencyRecord
      .delete({ where: { key } })
      .catch(() => undefined);
    throw error;
  }
}

export function newIdempotencyKey(prefix: string, userId: string): string {
  return `${prefix}:${userId}:${randomUUID()}`;
}
