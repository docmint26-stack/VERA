import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { NotificationType } from "@/generated/prisma/enums";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const notificationSelect = {
  id: true,
  type: true,
  title: true,
  body: true,
  link: true,
  data: true,
  readAt: true,
  createdAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const listQuery = paginationQuery.extend({
  read: z.boolean().optional(),
  type: z.array(z.nativeEnum(NotificationType)).optional(),
});

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function listNotifications(
  userId: string,
  query: z.infer<typeof listQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.NotificationWhereInput = {
    userId,
    ...(query.read !== undefined ? { readAt: query.read ? { not: null } : null } : {}),
    ...(query.type?.length ? { type: { in: query.type } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.notification.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: notificationSelect,
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

export async function getNotification(userId: string, id: string) {
  const notification = await getDb().notification.findFirst({
    where: { id, userId },
    select: notificationSelect,
  });
  if (!notification) throw errors.notFound("Notification not found.");
  return notification;
}

export async function markAsRead(userId: string, id: string) {
  const db = getDb();
  const notification = await db.notification.findFirst({
    where: { id, userId, readAt: null },
    select: { id: true },
  });
  if (!notification) throw errors.notFound("Notification not found or already read.");

  await db.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
  return { read: true };
}

export async function markAllAsRead(userId: string) {
  const db = getDb();
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { marked: true };
}

export async function deleteNotification(userId: string, id: string): Promise<void> {
  const db = getDb();
  const notification = await db.notification.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!notification) throw errors.notFound("Notification not found.");

  await db.notification.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Notification creation (internal use)
// ---------------------------------------------------------------------------

/** Create a notification for a user (internal service function). */
export async function createNotification(
  userId: string,
  input: {
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
    data?: unknown;
  },
): Promise<void> {
  const db = getDb();
  await db.notification.create({
    data: {
      user: { connect: { id: userId } },
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      data: (input.data as Prisma.InputJsonValue) ?? null,
      readAt: null,
    },
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  const count = await getDb().notification.count({
    where: { userId, readAt: null },
  });
  return count;
}
