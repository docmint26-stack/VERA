import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { AccountStatus, PlatformRole } from "@/generated/prisma/enums";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";
import { recordAudit } from "@/server/modules/common";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const userListQuery = paginationQuery.extend({
  role: z.array(z.nativeEnum(PlatformRole)).optional(),
  status: z.array(z.nativeEnum(AccountStatus)).optional(),
  emailVerified: z.boolean().optional(),
  q: z.string().max(200).optional(),
});

export const userUpdateInput = z.object({
  role: z.nativeEnum(PlatformRole).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listUsers(query: z.infer<typeof userListQuery>): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.UserWhereInput = {
    ...(query.role?.length ? { role: { in: query.role } } : {}),
    ...(query.status?.length ? { status: { in: query.status } } : {}),
    ...(query.emailVerified !== undefined ? { emailVerified: query.emailVerified } : {}),
    ...(query.q ? {
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { email: { contains: query.q, mode: "insensitive" } },
      ],
    } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.user.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: userSelect,
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

export async function getUser(userId: string) {
  const user = await getDb().user.findUnique({
    where: { id: userId },
    select: {
      ...userSelect,
      profile: true,
      preference: true,
      privacy: true,
      organizations: { select: { id: true, name: true, slug: true } },
    },
  });
  if (!user) throw errors.notFound("User not found.");
  return user;
}

export async function updateUser(userId: string, adminId: string, input: z.infer<typeof userUpdateInput>) {
  // Verify admin has PLATFORM_ADMIN role
  const admin = await getDb().user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });
  if (!admin || admin.role !== "PLATFORM_ADMIN") {
    throw errors.forbidden("You do not have permission to update users.");
  }

  const data: Prisma.UserUpdateInput = {};
  if (input.role !== undefined) data.role = input.role;
  if (input.status !== undefined) data.status = input.status;

  const user = await getDb().user.update({
    where: { id: userId },
    data,
    select: userSelect,
  });

  await recordAudit({
    actorId: adminId,
    action: "ADMIN.USER_UPDATED",
    targetType: "user",
    targetId: userId,
    metadata: { changes: Object.keys(data) },
  });

  return user;
}

export async function suspendUser(userId: string, adminId: string, reason?: string): Promise<void> {
  const admin = await getDb().user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });
  if (!admin || admin.role !== "PLATFORM_ADMIN") {
    throw errors.forbidden("You do not have permission to suspend users.");
  }

  await getDb().user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await recordAudit({
    actorId: adminId,
    action: "ADMIN.USER_SUSPENDED",
    targetType: "user",
    targetId: userId,
    metadata: { reason },
  });
}

// ---------------------------------------------------------------------------
// System stats
// ---------------------------------------------------------------------------

export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalOrganizations: number;
  totalFiles: number;
  totalStorageBytes: bigint;
  totalDocuments: number;
  totalAchievements: number;
}

export async function getSystemStats(): Promise<SystemStats> {
  const db = getDb();
  const [
    totalUsers,
    activeUsers,
    verifiedUsers,
    totalOrganizations,
    totalFiles,
    totalStorage,
    totalDocuments,
    totalAchievements,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { emailVerified: true } }),
    db.organization.count(),
    db.vaultFile.count({ where: { deletedAt: null } }),
    db.storageUsage.aggregate({ _sum: { usedBytes: true } }),
    db.document.count({ where: { isDeleted: false } }),
    db.achievement.count(),
  ]);

  return {
    totalUsers,
    activeUsers,
    verifiedUsers,
    totalOrganizations,
    totalFiles,
    totalStorageBytes: totalStorage._sum.usedBytes ?? BigInt(0),
    totalDocuments,
    totalAchievements,
  };
}

// ---------------------------------------------------------------------------
// Audit logs
// ---------------------------------------------------------------------------

export const auditListQuery = paginationQuery.extend({
  action: z.string().max(100).optional(),
  actorId: z.string().uuid().optional(),
  targetType: z.string().max(100).optional(),
  targetId: z.string().max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function listAuditLogs(query: z.infer<typeof auditListQuery>): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.AuditLogWhereInput = {
    ...(query.action ? { action: { contains: query.action, mode: "insensitive" } } : {}),
    ...(query.actorId ? { actorId: query.actorId } : {}),
    ...(query.targetType ? { targetType: { contains: query.targetType, mode: "insensitive" } } : {}),
    ...(query.targetId ? { targetId: { contains: query.targetId, mode: "insensitive" } } : {}),
    ...(query.startDate ? { createdAt: { gte: query.startDate } } : {}),
    ...(query.endDate ? { createdAt: { lte: query.endDate } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.auditLog.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: {
      id: true,
      actorId: true,
      action: true,
      targetType: true,
      targetId: true,
      requestId: true,
      ip: true,
      userAgent: true,
      createdAt: true,
    },
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

// ---------------------------------------------------------------------------
// Activity events
// ---------------------------------------------------------------------------

export const activityListQuery = paginationQuery.extend({
  type: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export async function listActivityEvents(query: z.infer<typeof activityListQuery>): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.ActivityEventWhereInput = {
    ...(query.type ? { type: { contains: query.type, mode: "insensitive" } } : {}),
    ...(query.userId ? { userId: query.userId } : {}),
    ...(query.startDate ? { createdAt: { gte: query.startDate } } : {}),
    ...(query.endDate ? { createdAt: { lte: query.endDate } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.activityEvent.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      subjectType: true,
      subjectId: true,
      meta: true,
      createdAt: true,
    },
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}
