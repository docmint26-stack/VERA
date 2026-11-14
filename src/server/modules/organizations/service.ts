import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import {
  OrgRole,
  OrgStatus,
} from "@/generated/prisma/enums";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";
import { recordActivity, recordAudit } from "@/server/modules/common";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const orgSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  website: true,
  logoKey: true,
  status: true,
  isVerifiedIssuer: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} as const;

const orgMemberSelect = {
  id: true,
  organizationId: true,
  userId: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

const orgInvitationSelect = {
  id: true,
  organizationId: true,
  email: true,
  role: true,
  token: false,
  status: true,
  invitedById: true,
  expiresAt: true,
  createdAt: true,
  respondedAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const orgCreateInput = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only."),
  description: z.string().max(1000).nullish(),
  website: z.string().url().max(500).nullish(),
});

export const orgUpdateInput = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).nullish(),
  website: z.string().url().max(500).nullish(),
  logoKey: z.string().max(255).nullish(),
});

export const memberUpdateInput = z.object({
  role: z.nativeEnum(OrgRole),
});

export const invitationCreateInput = z.object({
  email: z.string().email().max(255),
  role: z.nativeEnum(OrgRole).default("MEMBER"),
});

export const listOrgQuery = paginationQuery.extend({
  status: z.array(z.nativeEnum(OrgStatus)).optional(),
  q: z.string().max(200).optional(),
});

export const listMemberQuery = paginationQuery.extend({
  role: z.array(z.nativeEnum(OrgRole)).optional(),
  q: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

export async function listOrganizations(
  userId: string,
  query: z.infer<typeof listOrgQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.OrganizationWhereInput = {
    OR: [
      { createdById: userId },
      { members: { some: { userId } } },
    ],
    ...(query.status?.length ? { status: { in: query.status } } : {}),
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.organization.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: orgSelect,
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

export async function getOrganization(organizationId: string, userId: string) {
  const db = getDb();
  // Check if user is a member or creator
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId },
    select: { id: true },
  });
  const creator = await db.organization.findFirst({
    where: { id: organizationId, createdById: userId },
    select: { id: true },
  });

  if (!member && !creator) {
    throw errors.forbidden("You are not a member of this organization.");
  }

  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: orgSelect,
  });
  if (!org) throw errors.notFound("Organization not found.");
  return org;
}

export async function createOrganization(userId: string, input: z.infer<typeof orgCreateInput>) {
  const db = getDb();

  // Check slug is unique
  const existing = await db.organization.findFirst({
    where: { slug: input.slug },
    select: { id: true },
  });
  if (existing) throw errors.conflict("That organization slug is already taken.");

  const org = await db.organization.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      website: input.website ?? null,
      createdBy: { connect: { id: userId } },
    },
    select: orgSelect,
  });

  // Add creator as OWNER member
  await db.organizationMember.create({
    data: {
      organization: { connect: { id: org.id } },
      user: { connect: { id: userId } },
      role: "OWNER",
    },
  });

  await recordActivity(userId, "ORG_CREATED", "Organization created", {
    subjectType: "organization",
    subjectId: org.id,
  });

  await recordAudit({
    actorId: userId,
    action: "ORG.CREATED",
    targetType: "organization",
    targetId: org.id,
  });

  return org;
}

export async function updateOrganization(
  organizationId: string,
  userId: string,
  input: z.infer<typeof orgUpdateInput>,
) {
  const db = getDb();

  // Verify user has permission (OWNER or ADMIN)
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId, role: { in: ["OWNER", "ADMIN"] as OrgRole[] } },
    select: { id: true },
  });
  const creator = await db.organization.findFirst({
    where: { id: organizationId, createdById: userId },
    select: { id: true },
  });

  if (!member && !creator) {
    throw errors.forbidden("You do not have permission to update this organization.");
  }

  const data: Prisma.OrganizationUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.description !== undefined) data.description = input.description ?? null;
  if (input.website !== undefined) data.website = input.website ?? null;
  if (input.logoKey !== undefined) data.logoKey = input.logoKey ?? null;

  const org = await db.organization.update({
    where: { id: organizationId },
    data,
    select: orgSelect,
  });

  await recordActivity(userId, "ORG_UPDATED", "Organization updated", {
    subjectType: "organization",
    subjectId: organizationId,
  });

  await recordAudit({
    actorId: userId,
    action: "ORG.UPDATED",
    targetType: "organization",
    targetId: organizationId,
  });

  return org;
}

export async function deleteOrganization(organizationId: string, userId: string): Promise<void> {
  const db = getDb();

  // Verify user is OWNER
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId, role: "OWNER" },
    select: { id: true },
  });
  const creator = await db.organization.findFirst({
    where: { id: organizationId, createdById: userId },
    select: { id: true },
  });

  if (!member && !creator) {
    throw errors.forbidden("Only the organization owner can delete the organization.");
  }

  await db.organization.delete({ where: { id: organizationId } });

  await recordActivity(userId, "ORG_DELETED", "Organization deleted", {
    subjectType: "organization",
    subjectId: organizationId,
  });

  await recordAudit({
    actorId: userId,
    action: "ORG.DELETED",
    targetType: "organization",
    targetId: organizationId,
  });
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function listMembers(
  organizationId: string,
  userId: string,
  query: z.infer<typeof listMemberQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();

  // Verify user has permission
  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId },
    select: { id: true, role: true },
  });
  const creator = await db.organization.findFirst({
    where: { id: organizationId, createdById: userId },
    select: { id: true },
  });

  if (!member && !creator) {
    throw errors.forbidden("You are not a member of this organization.");
  }

  const where: Prisma.OrganizationMemberWhereInput = {
    organizationId,
    ...(query.role?.length ? { role: { in: query.role } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };

  // Only OWNER and ADMIN can see all members; MEMBER can only see themselves
  if (member?.role === "MEMBER") {
    where.userId = userId;
  }

  const rows = await db.organizationMember.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: {
      ...orgMemberSelect,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  type Result = typeof rows[number] & { id: string; createdAt: Date };
  return toPage(
    rows as Result[],
    query.limit,
    (row) => row.createdAt.toISOString(),
  );
}

export async function getMember(organizationId: string, memberId: string, requesterId: string) {
  const db = getDb();

  // Verify requester is a member
  const requester = await db.organizationMember.findFirst({
    where: { organizationId, userId: requesterId },
    select: { id: true, role: true },
  });
  const isCreator = await db.organization.findFirst({
    where: { id: organizationId, createdById: requesterId },
    select: { id: true },
  });

  if (!requester && !isCreator) {
    throw errors.forbidden("You are not a member of this organization.");
  }

  // Only OWNER, ADMIN, or the user themselves can view a member
  if (requester?.role === "MEMBER" && memberId !== requesterId) {
    throw errors.forbidden("You do not have permission to view this member.");
  }

  const member = await db.organizationMember.findFirst({
    where: { organizationId, userId: memberId },
    select: {
      ...orgMemberSelect,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });

  if (!member) throw errors.notFound("Member not found.");
  return member;
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  requesterId: string,
  input: z.infer<typeof memberUpdateInput>,
) {
  const db = getDb();

  // Verify requester has permission (OWNER or ADMIN)
  const requester = await db.organizationMember.findFirst({
    where: { organizationId, userId: requesterId, role: { in: ["OWNER", "ADMIN"] as OrgRole[] } },
    select: { id: true },
  });
  const isCreator = await db.organization.findFirst({
    where: { id: organizationId, createdById: requesterId },
    select: { id: true },
  });

  if (!requester && !isCreator) {
    throw errors.forbidden("You do not have permission to update member roles.");
  }

  // Cannot demote OWNER
  const targetMember = await db.organizationMember.findFirst({
    where: { organizationId, userId: memberId },
    select: { id: true, role: true },
  });
  if (!targetMember) throw errors.notFound("Member not found.");
  if (targetMember.role === "OWNER" && input.role !== "OWNER") {
    throw errors.forbidden("Cannot change the role of an OWNER.");
  }

  // Cannot promote to OWNER
  if (input.role === "OWNER") {
    throw errors.forbidden("Cannot promote to OWNER role.");
  }

  await db.organizationMember.update({
    where: { organizationId_userId: { organizationId, userId: memberId } },
    data: { role: input.role },
  });

  await recordActivity(requesterId, "ORG_MEMBER_UPDATED", "Member role updated", {
    subjectType: "organization",
    subjectId: organizationId,
  });

  await recordAudit({
    actorId: requesterId,
    action: "ORG.MEMBER_UPDATED",
    targetType: "organization_member",
    targetId: `${organizationId}:${memberId}`,
  });

  return { updated: true };
}

export async function removeMember(
  organizationId: string,
  memberId: string,
  requesterId: string,
): Promise<void> {
  const db = getDb();

  // Verify requester has permission (OWNER or ADMIN)
  const requester = await db.organizationMember.findFirst({
    where: { organizationId, userId: requesterId, role: { in: ["OWNER", "ADMIN"] as OrgRole[] } },
    select: { id: true },
  });
  const isCreator = await db.organization.findFirst({
    where: { id: organizationId, createdById: requesterId },
    select: { id: true },
  });

  if (!requester && !isCreator) {
    throw errors.forbidden("You do not have permission to remove members.");
  }

  // Cannot remove OWNER
  const targetMember = await db.organizationMember.findFirst({
    where: { organizationId, userId: memberId },
    select: { id: true, role: true },
  });
  if (!targetMember) throw errors.notFound("Member not found.");
  if (targetMember.role === "OWNER") {
    throw errors.forbidden("Cannot remove an OWNER member.");
  }

  await db.organizationMember.delete({
    where: { organizationId_userId: { organizationId, userId: memberId } },
  });

  await recordActivity(requesterId, "ORG_MEMBER_REMOVED", "Member removed", {
    subjectType: "organization",
    subjectId: organizationId,
  });

  await recordAudit({
    actorId: requesterId,
    action: "ORG.MEMBER_REMOVED",
    targetType: "organization_member",
    targetId: `${organizationId}:${memberId}`,
  });
}

// ---------------------------------------------------------------------------
// Invitations
// ---------------------------------------------------------------------------

export async function listInvitations(
  organizationId: string,
  userId: string,
): Promise<{ id: string; email: string; role: string; status: string; expiresAt: Date; createdAt: Date }[]> {
  const db = getDb();

  // Verify user has permission (OWNER or ADMIN)
  const requester = await db.organizationMember.findFirst({
    where: { organizationId, userId, role: { in: ["OWNER", "ADMIN"] as OrgRole[] } },
    select: { id: true },
  });
  const isCreator = await db.organization.findFirst({
    where: { id: organizationId, createdById: userId },
    select: { id: true },
  });

  if (!requester && !isCreator) {
    throw errors.forbidden("You do not have permission to view invitations.");
  }

  const invitations = await db.organizationInvitation.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: orgInvitationSelect,
  });

  return invitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
  }));
}

export async function createInvitation(
  organizationId: string,
  userId: string,
  input: z.infer<typeof invitationCreateInput>,
) {
  const db = getDb();

  // Verify user has permission (OWNER or ADMIN)
  const requester = await db.organizationMember.findFirst({
    where: { organizationId, userId, role: { in: ["OWNER", "ADMIN"] as OrgRole[] } },
    select: { id: true },
  });
  const isCreator = await db.organization.findFirst({
    where: { id: organizationId, createdById: userId },
    select: { id: true },
  });

  if (!requester && !isCreator) {
    throw errors.forbidden("You do not have permission to invite members.");
  }

  // Generate random token
  const token = (await import("node:crypto")).randomUUID();

  // Check for existing invitation to this email
  const existing = await db.organizationInvitation.findFirst({
    where: { organizationId, email: input.email, status: "PENDING" },
    select: { id: true },
  });
  if (existing) {
    // Return existing invitation
    const inv = await db.organizationInvitation.findUnique({
      where: { id: existing.id },
      select: orgInvitationSelect,
    });
    return {
      id: inv!.id,
      email: inv!.email,
      role: inv!.role,
      status: inv!.status,
      expiresAt: inv!.expiresAt,
      createdAt: inv!.createdAt,
    };
  }

  const invitation = await db.organizationInvitation.create({
    data: {
      organization: { connect: { id: organizationId } },
      email: input.email,
      role: input.role,
      token,
      invitedBy: { connect: { id: userId } },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "PENDING",
    },
    select: orgInvitationSelect,
  });

  await recordActivity(userId, "ORG_INVITATION_CREATED", "Invitation created", {
    subjectType: "organization",
    subjectId: organizationId,
  });

  await recordAudit({
    actorId: userId,
    action: "ORG.INVITATION_CREATED",
    targetType: "organization_invitation",
    targetId: invitation.id,
  });

  return {
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  };
}

export async function acceptInvitation(token: string, userId: string) {
  const db = getDb();

  const invitation = await db.organizationInvitation.findFirst({
    where: { token, status: "PENDING", expiresAt: { gt: new Date() } },
    select: {
      id: true,
      organizationId: true,
      email: true,
      role: true,
      invitedById: true,
    },
  });

  if (!invitation) {
    throw errors.notFound("Invitation not found or has expired.");
  }

  // Verify the email matches the user's email
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user || user.email !== invitation.email) {
    throw errors.forbidden("This invitation is not for your email address.");
  }

  // Check if user is already a member
  const existingMember = await db.organizationMember.findFirst({
    where: { organizationId: invitation.organizationId, userId },
    select: { id: true },
  });
  if (existingMember) {
    throw errors.conflict("You are already a member of this organization.");
  }

  // Accept invitation
  await db.$transaction([
    db.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
    db.organizationMember.create({
      data: {
        organization: { connect: { id: invitation.organizationId } },
        user: { connect: { id: userId } },
        role: invitation.role,
      },
    }),
  ]);

  await recordActivity(userId, "ORG_INVITATION_ACCEPTED", "Invitation accepted", {
    subjectType: "organization",
    subjectId: invitation.organizationId,
  });

  await recordAudit({
    actorId: userId,
    action: "ORG.INVITATION_ACCEPTED",
    targetType: "organization_invitation",
    targetId: invitation.id,
  });

  return { accepted: true };
}

export async function declineInvitation(token: string, userId: string) {
  const db = getDb();

  const invitation = await db.organizationInvitation.findFirst({
    where: { token, status: "PENDING" },
    select: { id: true, organizationId: true, email: true },
  });

  if (!invitation) {
    throw errors.notFound("Invitation not found.");
  }

  // Verify the email matches the user's email
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user || user.email !== invitation.email) {
    throw errors.forbidden("This invitation is not for your email address.");
  }

  await db.organizationInvitation.update({
    where: { id: invitation.id },
    data: { status: "DECLINED", respondedAt: new Date() },
  });

  await recordActivity(userId, "ORG_INVITATION_DECLINED", "Invitation declined", {
    subjectType: "organization",
    subjectId: invitation.organizationId,
  });

  await recordAudit({
    actorId: userId,
    action: "ORG.INVITATION_DECLINED",
    targetType: "organization_invitation",
    targetId: invitation.id,
  });

  return { declined: true };
}

export async function revokeInvitation(organizationId: string, invitationId: string, requesterId: string): Promise<void> {
  const db = getDb();

  // Verify requester has permission
  const requester = await db.organizationMember.findFirst({
    where: { organizationId, userId: requesterId, role: { in: ["OWNER", "ADMIN"] as OrgRole[] } },
    select: { id: true },
  });
  const isCreator = await db.organization.findFirst({
    where: { id: organizationId, createdById: requesterId },
    select: { id: true },
  });

  if (!requester && !isCreator) {
    throw errors.forbidden("You do not have permission to revoke invitations.");
  }

  const invitation = await db.organizationInvitation.findFirst({
    where: { id: invitationId, organizationId, status: "PENDING" },
    select: { id: true },
  });
  if (!invitation) throw errors.notFound("Invitation not found.");

  await db.organizationInvitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED", respondedAt: new Date() },
  });

  await recordActivity(requesterId, "ORG_INVITATION_REVOKED", "Invitation revoked", {
    subjectType: "organization",
    subjectId: organizationId,
  });

  await recordAudit({
    actorId: requesterId,
    action: "ORG.INVITATION_REVOKED",
    targetType: "organization_invitation",
    targetId: invitationId,
  });
}
