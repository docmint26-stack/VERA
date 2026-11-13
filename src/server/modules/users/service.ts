import { z } from "zod";
import { errors } from "@/lib/errors/app-error";
import { getDb } from "@/server/db/client";
import { recordActivity, recordAudit } from "@/server/modules/common";
import type { AuthUser } from "@/lib/api/route";

/**
 * User profile, preferences, privacy and passport entries (skills,
 * education, experience, social links).
 *
 * Every query is scoped by `userId` — there is no code path that reads
 * another user's private rows without an explicit public-visibility check.
 */

export const profileInput = z.object({
  headline: z.string().max(160).nullish(),
  bio: z.string().max(4000).nullish(),
  location: z.string().max(120).nullish(),
  occupation: z.string().max(120).nullish(),
});

export const preferencesInput = z.object({
  locale: z.string().max(10).optional(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  appearance: z.enum(["light", "dark", "system"]).optional(),
  motion: z.enum(["full", "reduced"]).optional(),
  emailDigest: z.boolean().optional(),
  opportunityAlerts: z.boolean().optional(),
  verificationUpdates: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  securityEmails: z.boolean().optional(),
});

export const privacyInput = z.object({
  profileVisibility: z.enum(["PUBLIC", "LINK_ONLY", "PRIVATE"]).optional(),
  achievementVisibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  filesPrivateByDefault: z.boolean().optional(),
  discoverableBySearch: z.boolean().optional(),
  allowAiDataAccess: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  shareLinkDefaultTtlHours: z.number().int().min(1).max(24 * 365).nullish(),
});

const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  image: true,
  role: true,
  status: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface MeResponse {
  user: unknown;
  profile: unknown;
  preferences: unknown;
  privacy: unknown;
}

export async function getMe(userId: string): Promise<MeResponse> {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { ...userSelect, profile: true, preference: true, privacy: true },
  });
  if (!user) throw errors.notFound("User not found.");
  const { profile, preference, privacy, ...rest } = user;
  return {
    user: rest,
    profile,
    preferences: preference,
    privacy,
  };
}

export async function updateProfile(userId: string, input: z.infer<typeof profileInput>): Promise<unknown> {
  const db = getDb();
  const data = {
    headline: input.headline ?? null,
    bio: input.bio ?? null,
    location: input.location ?? null,
    occupation: input.occupation ?? null,
  };
  const profile = await db.userProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  await recordActivity(userId, "PROFILE_UPDATED", "Profile updated", { subjectType: "profile", subjectId: userId });
  return profile;
}

export async function updatePreferences(userId: string, input: z.infer<typeof preferencesInput>): Promise<unknown> {
  const db = getDb();
  return db.userPreference.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}

export async function updatePrivacy(userId: string, input: z.infer<typeof privacyInput>): Promise<unknown> {
  const db = getDb();
  return db.userPrivacySetting.upsert({
    where: { userId },
    create: { userId, ...input },
    update: input,
  });
}

export async function updateIdentity(
  user: AuthUser,
  input: { name?: string; slug?: string | null },
  meta: { requestId: string; ip: string; userAgent?: string },
): Promise<unknown> {
  const db = getDb();
  const update: { name?: string; slug?: string | null } = {};
  if (input.name !== undefined) update.name = input.name.trim().slice(0, 100);
  if (input.slug !== undefined) {
    const slug = input.slug === null ? null : input.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").slice(0, 40);
    if (slug) {
      const clash = await db.user.findFirst({ where: { slug, NOT: { id: user.id } }, select: { id: true } });
      if (clash) throw errors.conflict("That profile address is already taken.");
    }
    update.slug = slug || null;
  }
  if (Object.keys(update).length === 0) return getMe(user.id);

  const updated = await db.user.update({
    where: { id: user.id },
    data: update,
    select: userSelect,
  });
  await recordAudit({
    actorId: user.id,
    action: "USER.IDENTITY_UPDATED",
    targetType: "user",
    targetId: user.id,
    requestId: meta.requestId,
    ip: meta.ip,
    userAgent: meta.userAgent,
    metadata: { fields: Object.keys(update) },
  });
  return updated;
}

// ---------------------------------------------------------------------------
// Passport entries
// ---------------------------------------------------------------------------

export const skillInput = z.object({
  name: z.string().min(1).max(80),
  proficiency: z.string().max(40).nullish(),
});

export async function listSkills(userId: string) {
  return getDb().userSkill.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function addSkill(userId: string, input: z.infer<typeof skillInput>) {
  const db = getDb();
  return db.userSkill.upsert({
    where: { userId_name: { userId, name: input.name } },
    create: { userId, name: input.name, proficiency: input.proficiency ?? null },
    update: { proficiency: input.proficiency ?? null },
  });
}

export async function removeSkill(userId: string, id: string) {
  const db = getDb();
  const row = await db.userSkill.findFirst({ where: { id, userId } });
  if (!row) throw errors.notFound("Skill not found.");
  await db.userSkill.delete({ where: { id } });
  return { deleted: true };
}

export const educationInput = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().max(200).nullish(),
  field: z.string().max(200).nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  current: z.boolean().optional(),
  description: z.string().max(2000).nullish(),
});

export async function listEducation(userId: string) {
  return getDb().userEducation.findMany({ where: { userId }, orderBy: { startDate: "desc" } });
}

export async function addEducation(userId: string, input: z.infer<typeof educationInput>) {
  return getDb().userEducation.create({ data: { userId, ...input } });
}

export async function updateEducation(userId: string, id: string, input: z.infer<typeof educationInput>) {
  const db = getDb();
  const row = await db.userEducation.findFirst({ where: { id, userId } });
  if (!row) throw errors.notFound("Entry not found.");
  return db.userEducation.update({ where: { id }, data: input });
}

export async function removeEducation(userId: string, id: string) {
  const db = getDb();
  const row = await db.userEducation.findFirst({ where: { id, userId } });
  if (!row) throw errors.notFound("Entry not found.");
  await db.userEducation.delete({ where: { id } });
  return { deleted: true };
}

export const experienceInput = z.object({
  organization: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  employmentType: z.string().max(60).nullish(),
  location: z.string().max(120).nullish(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  current: z.boolean().optional(),
  description: z.string().max(2000).nullish(),
});

export async function listExperience(userId: string) {
  return getDb().userExperience.findMany({ where: { userId }, orderBy: { startDate: "desc" } });
}

export async function addExperience(userId: string, input: z.infer<typeof experienceInput>) {
  return getDb().userExperience.create({ data: { userId, ...input } });
}

export async function updateExperience(userId: string, id: string, input: z.infer<typeof experienceInput>) {
  const db = getDb();
  const row = await db.userExperience.findFirst({ where: { id, userId } });
  if (!row) throw errors.notFound("Entry not found.");
  return db.userExperience.update({ where: { id }, data: input });
}

export async function removeExperience(userId: string, id: string) {
  const db = getDb();
  const row = await db.userExperience.findFirst({ where: { id, userId } });
  if (!row) throw errors.notFound("Entry not found.");
  await db.userExperience.delete({ where: { id } });
  return { deleted: true };
}

export const socialLinkInput = z.object({
  platform: z.string().min(1).max(40),
  url: z.string().url().max(500),
  label: z.string().max(80).nullish(),
});

export async function listSocialLinks(userId: string) {
  return getDb().userSocialLink.findMany({ where: { userId }, orderBy: { platform: "asc" } });
}

export async function addSocialLink(userId: string, input: z.infer<typeof socialLinkInput>) {
  return getDb().userSocialLink.upsert({
    where: { userId_url: { userId, url: input.url } },
    create: { userId, ...input },
    update: { platform: input.platform, label: input.label ?? null },
  });
}

export async function removeSocialLink(userId: string, id: string) {
  const db = getDb();
  const row = await db.userSocialLink.findFirst({ where: { id, userId } });
  if (!row) throw errors.notFound("Link not found.");
  await db.userSocialLink.delete({ where: { id } });
  return { deleted: true };
}

/**
 * Public profile view. Honours privacy settings: PRIVATE profiles are 404
 * for everyone else, LINK_ONLY is reachable by direct slug, PUBLIC is open.
 */
export async function getPublicProfile(slug: string, viewerId: string | null) {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      createdAt: true,
      email: true,
      emailVerified: true,
      profile: true,
      privacy: true,
      skills: { orderBy: { name: "asc" } },
      education: { orderBy: { startDate: "desc" } },
      experience: { orderBy: { startDate: "desc" } },
      socialLinks: true,
      achievements: {
        where: { visibility: "PUBLIC" },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
  if (!user) throw errors.notFound("Profile not found.");
  if (user.id === viewerId) return { ...user, privacy: undefined };

  const visibility = user.privacy?.profileVisibility ?? "PRIVATE";
  if (visibility === "PRIVATE") throw errors.notFound("Profile not found.");
  if (visibility === "LINK_ONLY" && !viewerId) {
    // reachable only with the direct link — this endpoint *is* the link
  }

  const showEmail = user.privacy?.showEmail ?? false;
  const showLocation = user.privacy?.showLocation ?? false;

  return {
    id: user.id,
    name: user.name,
    slug: user.slug,
    image: user.image,
    createdAt: user.createdAt,
    email: showEmail ? user.email : undefined,
    profile: user.profile
      ? {
          headline: user.profile.headline,
          bio: user.profile.bio,
          occupation: user.profile.occupation,
          location: showLocation ? user.profile.location : undefined,
          avatarUpdatedAt: user.profile.avatarUpdatedAt,
        }
      : null,
    skills: user.skills,
    education: user.education,
    experience: user.experience,
    socialLinks: user.socialLinks,
    achievements: user.achievements,
  };
}
