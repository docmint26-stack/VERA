import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import {
  VerificationStatus,
  VerificationChannel,
  EvidenceType,
} from "@/generated/prisma/enums";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";
import { recordActivity, recordAudit } from "@/server/modules/common";
import * as notifications from "@/server/modules/notifications/service";

// ---------------------------------------------------------------------------
// Verification Foundation (Phase 2 - data structures only, workflow in Phase 4)
// ---------------------------------------------------------------------------

const verificationRequestSelect = {
  id: true,
  requesterId: true,
  achievementId: true,
  verifierId: true,
  organizationId: true,
  channel: true,
  status: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  decidedAt: true,
} as const;

const verificationEvidenceSelect = {
  id: true,
  requestId: true,
  type: true,
  url: true,
  fileId: true,
  note: true,
  createdAt: true,
} as const;

const verificationEventSelect = {
  id: true,
  requestId: true,
  actorId: true,
  action: true,
  fromStatus: true,
  toStatus: true,
  note: true,
  createdAt: true,
} as const;

const credentialSelect = {
  id: true,
  subjectId: true,
  issuerOrganizationId: true,
  achievementId: true,
  type: true,
  schemaVersion: true,
  status: true,
  issuanceDate: true,
  expirationDate: true,
  context: true,
  credentialSubject: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const createRequestInput = z.object({
  achievementId: z.string().uuid(),
  organizationId: z.string().uuid().optional(),
  channel: z.nativeEnum(VerificationChannel).default("ORGANIZATION"),
  message: z.string().max(2000).optional(),
});

export const updateRequestInput = z.object({
  message: z.string().max(2000).optional(),
});

export const evidenceAddInput = z.object({
  type: z.nativeEnum(EvidenceType),
  url: z.string().url().max(500).optional(),
  fileId: z.string().uuid().optional(),
  note: z.string().max(400).optional(),
});

export const decisionInput = z.object({
  approved: z.boolean(),
  reason: z.string().max(2000).optional(),
});

export const listRequestsQuery = paginationQuery.extend({
  status: z.array(z.nativeEnum(VerificationStatus)).optional(),
  channel: z.array(z.nativeEnum(VerificationChannel)).optional(),
  q: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Verification Requests
// ---------------------------------------------------------------------------

/**
 * Create a verification request for an achievement.
 * Phase 2: This creates the request but does not trigger workflow.
 */
export async function createRequest(
  requesterId: string,
  input: z.infer<typeof createRequestInput>,
) {
  const db = getDb();

  // Verify achievement belongs to requester
  const achievement = await db.achievement.findFirst({
    where: { id: input.achievementId, ownerId: requesterId },
    select: { id: true, status: true },
  });
  if (!achievement) throw errors.notFound("Achievement not found.");

  // Check if already verified
  if (achievement.status === "VERIFIED") {
    throw errors.conflict("This achievement is already verified.");
  }

  // Verify organization exists and requester is a member (for ORGANIZATION channel)
  if (input.organizationId) {
    const orgMember = await db.organizationMember.findFirst({
      where: { organizationId: input.organizationId, userId: requesterId },
      select: { id: true },
    });
    if (!orgMember) {
      throw errors.notFound("Organization not found or you are not a member.");
    }
  }

  const request = await db.verificationRequest.create({
    data: {
      requester: { connect: { id: requesterId } },
      achievement: { connect: { id: input.achievementId } },
      organization: input.organizationId ? { connect: { id: input.organizationId } } : undefined,
      channel: input.channel,
      status: "PENDING",
      message: input.message ?? null,
    },
    select: verificationRequestSelect,
  });

  // Update achievement status
  await db.achievement.update({
    where: { id: input.achievementId },
    data: { status: "VERIFICATION_PENDING" },
  });

  await recordActivity(requesterId, "VERIFICATION_REQUEST_CREATED", "Verification request created", {
    subjectType: "verification_request",
    subjectId: request.id,
  });

  await recordAudit({
    actorId: requesterId,
    action: "VERIFICATION.REQUEST_CREATED",
    targetType: "verification_request",
    targetId: request.id,
  });

  return request;
}

/** List verification requests for a user. */
export async function listRequests(
  userId: string,
  query: z.infer<typeof listRequestsQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.VerificationRequestWhereInput = {
    OR: [
      { requesterId: userId },
      { verifierId: userId },
    ],
    ...(query.status?.length ? { status: { in: query.status } } : {}),
    ...(query.channel?.length ? { channel: { in: query.channel } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.verificationRequest.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: verificationRequestSelect,
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

/** Get verification request by ID. */
export async function getRequest(userId: string, id: string) {
  const db = getDb();
  const request = await db.verificationRequest.findFirst({
    where: { id, OR: [{ requesterId: userId }, { verifierId: userId }] },
    select: {
      ...verificationRequestSelect,
      requester: { select: { id: true, name: true, email: true } },
      achievement: {
        select: {
          id: true,
          title: true,
          type: true,
          ownerId: true,
        },
      },
      organization: { select: { id: true, name: true, slug: true } },
      verifier: { select: { id: true, name: true, email: true } },
      evidence: { select: verificationEvidenceSelect },
      events: { select: verificationEventSelect, orderBy: { createdAt: "desc" } },
    },
  });
  if (!request) throw errors.notFound("Verification request not found.");
  return request;
}

/** Update verification request (add message). */
export async function updateRequest(
  userId: string,
  id: string,
  input: z.infer<typeof updateRequestInput>,
) {
  const db = getDb();
  const request = await db.verificationRequest.findFirst({
    where: { id, requesterId: userId },
    select: { id: true },
  });
  if (!request) throw errors.notFound("Verification request not found.");

  const updated = await db.verificationRequest.update({
    where: { id },
    data: { message: input.message ?? null },
    select: verificationRequestSelect,
  });

  await recordActivity(userId, "VERIFICATION_REQUEST_UPDATED", "Verification request updated", {
    subjectType: "verification_request",
    subjectId: id,
  });

  return updated;
}

/** Cancel verification request. */
export async function cancelRequest(userId: string, id: string): Promise<void> {
  const db = getDb();
  const request = await db.verificationRequest.findFirst({
    where: { id, requesterId: userId, status: "PENDING" },
    select: { id: true, achievementId: true },
  });
  if (!request) throw errors.notFound("Verification request not found or already processed.");

  await db.verificationRequest.update({
    where: { id },
    data: { status: "CANCELLED", decidedAt: new Date() },
  });

  // Restore achievement status if linked
  if (request.achievementId) {
    await db.achievement.update({
      where: { id: request.achievementId },
      data: { status: "CLAIMED" },
    });
  }

  await recordActivity(userId, "VERIFICATION_REQUEST_CANCELLED", "Verification request cancelled", {
    subjectType: "verification_request",
    subjectId: id,
  });

  await recordAudit({
    actorId: userId,
    action: "VERIFICATION.REQUEST_CANCELLED",
    targetType: "verification_request",
    targetId: id,
  });
}

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

/** Add evidence to a verification request. */
export async function addEvidence(
  userId: string,
  requestId: string,
  input: z.infer<typeof evidenceAddInput>,
) {
  const db = getDb();
  const request = await db.verificationRequest.findFirst({
    where: { id: requestId, requesterId: userId },
    select: { id: true },
  });
  if (!request) throw errors.notFound("Verification request not found.");

  // Validate file belongs to user if fileId is provided
  if (input.fileId) {
    const file = await db.vaultFile.findFirst({
      where: { id: input.fileId, ownerId: userId, deletedAt: null },
      select: { id: true },
    });
    if (!file) throw errors.notFound("File not found.");
  }

  const evidence = await db.verificationEvidence.create({
    data: {
      request: { connect: { id: requestId } },
      type: input.type,
      url: input.url ?? null,
      fileId: input.fileId ?? null,
      note: input.note ?? null,
    },
    select: verificationEvidenceSelect,
  });

  await recordActivity(userId, "VERIFICATION_EVIDENCE_ADDED", "Evidence added to verification request", {
    subjectType: "verification_request",
    subjectId: requestId,
  });

  return evidence;
}

// ---------------------------------------------------------------------------
// Decisions (Phase 4: VERIFIER role will use these)
// ---------------------------------------------------------------------------

/**
 * Record a verification decision.
 * Phase 2: This is a foundation function; actual verification workflow is Phase 4.
 */
export async function recordDecision(
  verifierId: string,
  requestId: string,
  input: z.infer<typeof decisionInput>,
) {
  const db = getDb();

  // Verify request exists and verifier has VERIFIER role
  const verifier = await db.user.findUnique({
    where: { id: verifierId },
    select: { role: true },
  });
  if (!verifier || verifier.role !== "VERIFIER") {
    throw errors.forbidden("You do not have permission to verify requests.");
  }

  const request = await db.verificationRequest.findFirst({
    where: { id: requestId, status: "PENDING" },
    select: { id: true, requesterId: true, achievementId: true, status: true },
  });
  if (!request) throw errors.notFound("Verification request not found or already processed.");

  const newStatus = input.approved ? "APPROVED" : "REJECTED";
  const fromStatus = request.status as VerificationStatus;

  await db.$transaction(async (tx) => {
    // Update request
    await tx.verificationRequest.update({
      where: { id: requestId },
      data: {
        verifier: { connect: { id: verifierId } },
        status: newStatus,
        decidedAt: new Date(),
      },
    });

    // Record event
    await tx.verificationEvent.create({
      data: {
        request: { connect: { id: requestId } },
        actorId: verifierId,
        action: input.approved ? "APPROVED" : "REJECTED",
        fromStatus,
        toStatus: newStatus,
        note: input.reason ?? null,
      },
    });

    // Update achievement status if approved and linked
    if (request.achievementId) {
      if (input.approved) {
        await tx.achievement.update({
          where: { id: request.achievementId },
          data: { status: "VERIFIED" },
        });

        // Create credential record
        await tx.credentialRecord.create({
          data: {
            subjectId: request.requesterId,
            issuerOrganizationId: null,
            achievementId: request.achievementId,
            type: "VerifiableCredential",
            schemaVersion: "1.0",
            status: "ISSUED",
            issuanceDate: new Date(),
          },
        });
      } else {
        await tx.achievement.update({
          where: { id: request.achievementId },
          data: { status: "REJECTED" },
        });
      }
    }
  });

  await recordActivity(verifierId, "VERIFICATION_DECISION", `Verification ${input.approved ? "approved" : "rejected"}`, {
    subjectType: "verification_request",
    subjectId: requestId,
  });

  await recordAudit({
    actorId: verifierId,
    action: `VERIFICATION.${input.approved ? "APPROVED" : "REJECTED"}`,
    targetType: "verification_request",
    targetId: requestId,
  });

  // Notify user
  await notifications.createNotification(request.requesterId, {
    type: "VERIFICATION_REQUEST_RECEIVED",
    title: `Verification ${input.approved ? "Approved" : "Rejected"}`,
    body: `Your verification request has been ${input.approved ? "approved" : "rejected"}.`,
    link: `/app/verification/requests/${requestId}`,
    data: { requestId, status: newStatus },
  });

  return { decided: true, status: newStatus };
}

// ---------------------------------------------------------------------------
// Credentials
// ---------------------------------------------------------------------------

/** List credentials for a user. */
export async function listCredentials(userId: string) {
  const credentials = await getDb().credentialRecord.findMany({
    where: { subjectId: userId },
    orderBy: { issuanceDate: "desc" },
    select: {
      ...credentialSelect,
      subject: { select: { id: true, name: true } },
      issuer: { select: { id: true, name: true, slug: true } },
      achievement: { select: { id: true, title: true, type: true } },
      statusEvents: { select: { id: true, fromStatus: true, toStatus: true, reason: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });
  return credentials;
}

/** Get credential by ID. */
export async function getCredential(id: string) {
  const credential = await getDb().credentialRecord.findUnique({
    where: { id },
    select: {
      ...credentialSelect,
      subject: { select: { id: true, name: true, email: true } },
      issuer: { select: { id: true, name: true, slug: true, isVerifiedIssuer: true } },
      achievement: { select: { id: true, title: true, type: true, issuer: true, periodStart: true, periodEnd: true } },
      statusEvents: { select: { id: true, fromStatus: true, toStatus: true, reason: true, actorId: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!credential) throw errors.notFound("Credential not found.");
  return credential;
}

/** Get public credential for verification (Phase 4). */
export async function getPublicCredential(id: string) {
  const credential = await getDb().credentialRecord.findUnique({
    where: { id },
    select: {
      id: true,
      subjectId: true,
      issuerOrganizationId: true,
      achievementId: true,
      type: true,
      schemaVersion: true,
      status: true,
      issuanceDate: true,
      expirationDate: true,
      credentialSubject: true,
      createdAt: true,
      issuer: { select: { id: true, name: true, slug: true, isVerifiedIssuer: true } },
      subject: { select: { id: true, name: true } },
      achievement: { select: { id: true, title: true, type: true, issuer: true } },
    },
  });
  if (!credential) throw errors.notFound("Credential not found.");
  return credential;
}
