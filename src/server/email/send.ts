import { getEnv } from "@/lib/config/env";
import { getDb } from "@/server/db/client";
import { logger } from "@/server/observability/logger";
import { getEmailProvider, type EmailMessage, type EmailSendResult } from "./provider";

/**
 * Durable transactional email dispatch.
 *
 * Every message is recorded in the `OutboxEvent` table first (marked
 * `sensitive` so its payload is never logged), then:
 *   EMAIL_DELIVERY_MODE=inline — delivered immediately with retries; failures
 *                                stay PENDING/FAILED for the worker to retry.
 *   EMAIL_DELIVERY_MODE=queue  — only enqueued; requires `npm run worker`.
 *
 * `delivered` is true only when a real provider accepted the message. The dev
 * provider returns delivered=false with localCapture=true.
 */

export interface SendEmailInput extends EmailMessage {
  aggregateType: string;
  aggregateId: string;
}

const MAX_INLINE_ATTEMPTS = 3;
const INLINE_BACKOFF_MS = [250, 1000];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendEmail(input: SendEmailInput): Promise<EmailSendResult> {
  const env = getEnv();
  const db = getDb();
  const { aggregateType, aggregateId, ...message } = input;

  const outbox = await db.outboxEvent.create({
    data: {
      aggregateType,
      aggregateId,
      eventType: "EMAIL_DELIVERY",
      sensitive: true,
      payload: { ...message } as object,
      status: "PENDING",
      availableAt: new Date(),
    },
  });

  if (env.EMAIL_DELIVERY_MODE === "queue") {
    logger.info("email.queued", { service: "email", operation: message.tag, outboxId: outbox.id });
    return { delivered: false, provider: getProviderName(), localCapture: false, messageId: outbox.id };
  }

  let lastResult: EmailSendResult = { delivered: false, provider: getProviderName(), error: "not attempted" };
  for (let attempt = 1; attempt <= MAX_INLINE_ATTEMPTS; attempt++) {
    try {
      const provider = getEmailProvider();
      lastResult = await provider.send(message);
      if (lastResult.delivered || lastResult.localCapture) {
        await db.outboxEvent.update({
          where: { id: outbox.id },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            attempts: attempt,
            lastError: null,
          },
        });
        logger.info("email.sent", {
          service: "email",
          operation: message.tag,
          outboxId: outbox.id,
          provider: lastResult.provider,
          delivered: lastResult.delivered,
          localCapture: lastResult.localCapture ?? false,
        });
        return lastResult;
      }
    } catch (error) {
      lastResult = { delivered: false, provider: getProviderName(), error: String(error) };
    }
    if (attempt < MAX_INLINE_ATTEMPTS) await sleep(INLINE_BACKOFF_MS[attempt - 1] ?? 1000);
  }

  await db.outboxEvent.update({
    where: { id: outbox.id },
    data: { status: "FAILED", attempts: MAX_INLINE_ATTEMPTS, lastError: lastResult.error ?? "unknown" },
  });
  logger.error("email.failed", {
    service: "email",
    operation: message.tag,
    outboxId: outbox.id,
    error: lastResult.error,
  });
  return lastResult;
}

function getProviderName() {
  try {
    return getEmailProvider().name;
  } catch {
    return "dev" as const;
  }
}

/** Used by the background worker: claim due PENDING/FAILED outbox entries. */
export async function claimDueOutbox(limit = 10): Promise<
  Array<{ id: string; eventType: string; payload: unknown; attempts: number }>
> {
  const db = getDb();
  const now = new Date();
  const due = await db.outboxEvent.findMany({
    where: { status: { in: ["PENDING", "FAILED"] }, availableAt: { lte: now }, eventType: "EMAIL_DELIVERY" },
    orderBy: { availableAt: "asc" },
    take: limit,
  });
  if (due.length === 0) return [];
  const ids = due.map((e) => e.id);
  await db.outboxEvent.updateMany({
    where: { id: { in: ids }, status: { in: ["PENDING", "FAILED"] } },
    data: { status: "PROCESSING" },
  });
  return due.map((e) => ({ id: e.id, eventType: e.eventType, payload: e.payload, attempts: e.attempts }));
}

export async function completeOutbox(id: string, result: EmailSendResult, attempt: number): Promise<void> {
  const db = getDb();
  await db.outboxEvent.update({
    where: { id },
    data: result.delivered || result.localCapture
      ? { status: "PROCESSED", processedAt: new Date(), attempts: attempt, lastError: null }
      : { status: "FAILED", attempts: attempt, lastError: result.error ?? "unknown", availableAt: new Date(Date.now() + 30_000 * attempt) },
  });
}
