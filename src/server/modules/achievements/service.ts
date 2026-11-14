import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import {
  AchievementType,
  ClaimStatus,
  ContentVisibility,
  EvidenceType,
} from "@/generated/prisma/enums";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";
import { recordActivity } from "@/server/modules/common";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const achievementSelect = {
  id: true,
  type: true,
  title: true,
  description: true,
  issuer: true,
  role: true,
  url: true,
  periodStart: true,
  periodEnd: true,
  occurredOn: true,
  visibility: true,
  status: true,
  evidenceCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

const achievementEvidenceSelect = {
  id: true,
  type: true,
  url: true,
  fileId: true,
  note: true,
  createdAt: true,
} as const;

const achievementSkillSelect = {
  id: true,
  name: true,
  createdAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const achievementCreateInput = z.object({
  type: z.nativeEnum(AchievementType),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).nullish(),
  issuer: z.string().max(200).nullish(),
  role: z.string().max(200).nullish(),
  url: z.string().url().max(500).nullish(),
  periodStart: z.coerce.date().nullish(),
  periodEnd: z.coerce.date().nullish(),
  occurredOn: z.coerce.date().nullish(),
  visibility: z.nativeEnum(ContentVisibility).default("PRIVATE"),
});

export const achievementUpdateInput = z.object({
  type: z.nativeEnum(AchievementType).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(4000).nullish(),
  issuer: z.string().max(200).nullish(),
  role: z.string().max(200).nullish(),
  url: z.string().url().max(500).nullish(),
  periodStart: z.coerce.date().nullish(),
  periodEnd: z.coerce.date().nullish(),
  occurredOn: z.coerce.date().nullish(),
  visibility: z.nativeEnum(ContentVisibility).optional(),
});

export const evidenceAddInput = z.object({
  type: z.nativeEnum(EvidenceType),
  url: z.string().url().max(500).nullish(),
  fileId: z.string().uuid().nullish(),
  note: z.string().max(400).nullish(),
});

export const skillAddInput = z.object({
  name: z.string().min(1).max(80),
});

export const listQuery = paginationQuery.extend({
  type: z.array(z.nativeEnum(AchievementType)).optional(),
  visibility: z.array(z.nativeEnum(ContentVisibility)).optional(),
  status: z.array(z.nativeEnum(ClaimStatus)).optional(),
  q: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export async function listAchievements(
  ownerId: string,
  query: z.infer<typeof listQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.AchievementWhereInput = {
    ownerId,
    ...(query.type?.length ? { type: { in: query.type } } : {}),
    ...(query.visibility?.length ? { visibility: { in: query.visibility } } : {}),
    ...(query.status?.length ? { status: { in: query.status } } : {}),
    ...(query.q ? { title: { contains: query.q, mode: "insensitive" } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.achievement.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: achievementSelect,
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

export async function getAchievement(ownerId: string, id: string) {
  const achievement = await getDb().achievement.findFirst({
    where: { id, ownerId },
    select: {
      ...achievementSelect,
      evidence: { select: achievementEvidenceSelect, orderBy: { createdAt: "desc" } },
      skills: { select: achievementSkillSelect, orderBy: { name: "asc" } },
    },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");
  return achievement;
}

export async function createAchievement(ownerId: string, input: z.infer<typeof achievementCreateInput>) {
  const db = getDb();
  const achievement = await db.achievement.create({
    data: {
      owner: { connect: { id: ownerId } },
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      issuer: input.issuer ?? null,
      role: input.role ?? null,
      url: input.url ?? null,
      periodStart: input.periodStart ?? null,
      periodEnd: input.periodEnd ?? null,
      occurredOn: input.occurredOn ?? null,
      visibility: input.visibility,
      status: "CLAIMED",
      evidenceCount: 0,
    },
    select: achievementSelect,
  });
  await recordActivity(ownerId, "ACHIEVEMENT_CREATED", "Achievement created", {
    subjectType: "achievement",
    subjectId: achievement.id,
  });
  return achievement;
}

export async function updateAchievement(ownerId: string, id: string, input: z.infer<typeof achievementUpdateInput>) {
  const db = getDb();
  const achievement = await db.achievement.findFirst({
    where: { id, ownerId },
    select: { id: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  const data: Prisma.AchievementUpdateInput = {};
  if (input.type !== undefined) data.type = input.type;
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description ?? null;
  if (input.issuer !== undefined) data.issuer = input.issuer ?? null;
  if (input.role !== undefined) data.role = input.role ?? null;
  if (input.url !== undefined) data.url = input.url ?? null;
  if (input.periodStart !== undefined) data.periodStart = input.periodStart ?? null;
  if (input.periodEnd !== undefined) data.periodEnd = input.periodEnd ?? null;
  if (input.occurredOn !== undefined) data.occurredOn = input.occurredOn ?? null;
  if (input.visibility !== undefined) data.visibility = input.visibility;

  const updated = await db.achievement.update({
    where: { id },
    data,
    select: achievementSelect,
  });
  await recordActivity(ownerId, "ACHIEVEMENT_UPDATED", "Achievement updated", {
    subjectType: "achievement",
    subjectId: id,
  });
  return updated;
}

export async function deleteAchievement(ownerId: string, id: string): Promise<void> {
  const db = getDb();
  const achievement = await db.achievement.findFirst({
    where: { id, ownerId },
    select: { id: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  await db.achievement.delete({ where: { id } });
  await recordActivity(ownerId, "ACHIEVEMENT_DELETED", "Achievement deleted", {
    subjectType: "achievement",
    subjectId: id,
  });
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export async function addEvidence(
  ownerId: string,
  achievementId: string,
  input: z.infer<typeof evidenceAddInput>,
) {
  const db = getDb();
  const achievement = await db.achievement.findFirst({
    where: { id: achievementId, ownerId },
    select: { id: true, evidenceCount: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  // Validate file belongs to owner if fileId is provided
  if (input.fileId) {
    const file = await db.vaultFile.findFirst({
      where: { id: input.fileId, ownerId, deletedAt: null },
      select: { id: true },
    });
    if (!file) throw errors.notFound("File not found.");
  }

  const evidence = await db.achievementEvidence.create({
    data: {
      achievement: { connect: { id: achievementId } },
      type: input.type,
      url: input.url ?? null,
      file: input.fileId ? { connect: { id: input.fileId } } : undefined,
      note: input.note ?? null,
      addedById: ownerId,
    },
    select: achievementEvidenceSelect,
  });

  // Update evidence count
  await db.achievement.update({
    where: { id: achievementId },
    data: { evidenceCount: { increment: 1 } },
  });

  await recordActivity(ownerId, "ACHIEVEMENT_EVIDENCE_ADDED", "Evidence added", {
    subjectType: "achievement",
    subjectId: achievementId,
  });

  return evidence;
}

export async function removeEvidence(ownerId: string, achievementId: string, evidenceId: string): Promise<void> {
  const db = getDb();
  const evidence = await db.achievementEvidence.findFirst({
    where: { id: evidenceId, achievementId },
    select: { id: true },
  });
  if (!evidence) throw errors.notFound("Evidence not found.");

  // Verify achievement belongs to owner
  const achievement = await db.achievement.findFirst({
    where: { id: achievementId, ownerId },
    select: { id: true, evidenceCount: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  await db.achievementEvidence.delete({ where: { id: evidenceId } });

  // Update evidence count
  await db.achievement.update({
    where: { id: achievementId },
    data: { evidenceCount: { decrement: 1 } },
  });

  await recordActivity(ownerId, "ACHIEVEMENT_EVIDENCE_REMOVED", "Evidence removed", {
    subjectType: "achievement",
    subjectId: achievementId,
  });
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

export async function addSkill(ownerId: string, achievementId: string, input: z.infer<typeof skillAddInput>) {
  const db = getDb();
  const achievement = await db.achievement.findFirst({
    where: { id: achievementId, ownerId },
    select: { id: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  const skill = await db.achievementSkill.upsert({
    where: { achievementId_name: { achievementId, name: input.name } },
    create: {
      achievement: { connect: { id: achievementId } },
      name: input.name,
    },
    update: {},
    select: achievementSkillSelect,
  });

  await recordActivity(ownerId, "ACHIEVEMENT_SKILL_ADDED", "Skill added to achievement", {
    subjectType: "achievement",
    subjectId: achievementId,
  });

  return skill;
}

export async function removeSkill(ownerId: string, achievementId: string, skillId: string): Promise<void> {
  const db = getDb();
  const skill = await db.achievementSkill.findFirst({
    where: { id: skillId, achievementId },
    select: { id: true },
  });
  if (!skill) throw errors.notFound("Skill not found.");

  // Verify achievement belongs to owner
  const achievement = await db.achievement.findFirst({
    where: { id: achievementId, ownerId },
    select: { id: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  await db.achievementSkill.delete({ where: { id: skillId } });

  await recordActivity(ownerId, "ACHIEVEMENT_SKILL_REMOVED", "Skill removed from achievement", {
    subjectType: "achievement",
    subjectId: achievementId,
  });
}

// ---------------------------------------------------------------------------
// Public / Passport view
// ---------------------------------------------------------------------------

export async function listPublicAchievements(userId: string) {
  const achievements = await getDb().achievement.findMany({
    where: { ownerId: userId, visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    select: {
      ...achievementSelect,
      evidence: { select: achievementEvidenceSelect, take: 10 },
      skills: { select: achievementSkillSelect },
    },
    take: 50,
  });
  return achievements;
}
