import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { getDb } from "@/server/db/client";
import { getObjectStorage, generateStorageKey } from "@/server/storage";
import { declaredUploadAllowed, scanUpload } from "@/server/storage/scan";
import { recordActivity } from "@/server/modules/common";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const vaultFolderSelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  parentId: true,
} as const;

const vaultFileSelect = {
  id: true,
  name: true,
  storageKey: true,
  mimeType: true,
  sizeBytes: true,
  status: true,
  scanStatus: true,
  isStarred: true,
  version: true,
  folderId: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ---------------------------------------------------------------------------
// Input schemas
// ---------------------------------------------------------------------------

export const folderCreateInput = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().nullish(),
});

export const folderUpdateInput = z.object({
  name: z.string().min(1).max(255).optional(),
  parentId: z.string().uuid().nullish(),
});

export const fileUploadIntentInput = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(128),
  sizeBytes: z.number().int().min(1).max(1024 * 1024 * 1024 * 10), // 10 GB
  folderId: z.string().uuid().nullish(),
});

export const fileUploadCompleteInput = z.object({
  uploadId: z.string().uuid(),
  checksumSha256: z.string().length(64).optional(),
  sizeBytes: z.number().int().min(1).optional(),
});

export const fileUpdateInput = z.object({
  name: z.string().min(1).max(255).optional(),
  folderId: z.string().uuid().nullish(),
  isStarred: z.boolean().optional(),
});

export const listFilesQuery = paginationQuery.extend({
  folderId: z.string().uuid().nullish(),
  status: z.array(z.enum(["PENDING", "UPLOADING", "PROCESSING", "AVAILABLE", "REJECTED", "QUARANTINED", "FAILED"])).optional(),
  scanStatus: z.array(z.enum(["PENDING", "CLEAN", "MALWARE", "UNSAFE", "ERROR"])).optional(),
  q: z.string().max(200).optional(),
  star: z.boolean().optional(),
});

export const listFoldersQuery = paginationQuery.extend({
  parentId: z.string().uuid().nullish(),
  q: z.string().max(200).optional(),
});

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export async function getRootFolder(ownerId: string): Promise<{ id: string; name: string }> {
  const db = getDb();
  // Try to find or create the root folder
  let root = await db.vaultFolder.findFirst({
    where: { ownerId, parentId: null, name: "Root" },
    select: { id: true, name: true },
  });
  if (!root) {
    root = await db.vaultFolder.create({
      data: { ownerId, name: "Root", parentId: null },
      select: { id: true, name: true },
    });
  }
  return root;
}

export async function listFolders(
  ownerId: string,
  query: z.infer<typeof listFoldersQuery>,
): Promise<Page<{ id: string; createdAt: Date }>> {
  const db = getDb();
  const where: Prisma.VaultFolderWhereInput = {
    ownerId,
    deletedAt: null,
    parentId: query.parentId ?? null,
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    ...(cursorWhere("createdAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.vaultFolder.findMany({
    where,
    orderBy: orderByWithCursor("createdAt", "desc"),
    take: query.limit + 1,
    select: vaultFolderSelect,
  });
  return toPage(rows, query.limit, (row) => row.createdAt.toISOString());
}

export async function getFolder(ownerId: string, id: string) {
  const folder = await getDb().vaultFolder.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: vaultFolderSelect,
  });
  if (!folder) throw errors.notFound("Folder not found.");
  return folder;
}

export async function createFolder(ownerId: string, input: z.infer<typeof folderCreateInput>) {
  const db = getDb();
  
  // Validate parent exists and belongs to owner
  if (input.parentId) {
    const parent = await db.vaultFolder.findFirst({
      where: { id: input.parentId, ownerId, deletedAt: null },
      select: { id: true },
    });
    if (!parent) throw errors.notFound("Parent folder not found.");
  }
  
  // Check for duplicate name in same parent
  const existing = await db.vaultFolder.findFirst({
    where: {
      ownerId,
      parentId: input.parentId ?? null,
      name: input.name,
      deletedAt: null,
    },
    select: { id: true },
  });
  if (existing) throw errors.conflict("A folder with this name already exists in this location.");

  const folder = await db.vaultFolder.create({
    data: { ownerId, ...input },
    select: vaultFolderSelect,
  });
  await recordActivity(ownerId, "FOLDER_CREATED", "Folder created", {
    subjectType: "folder",
    subjectId: folder.id,
  });
  return folder;
}

export async function updateFolder(ownerId: string, id: string, input: z.infer<typeof folderUpdateInput>) {
  const db = getDb();
  const folder = await db.vaultFolder.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: { id: true, parentId: true, name: true },
  });
  if (!folder) throw errors.notFound("Folder not found.");

  // Validate parent exists and belongs to owner (if changing parent)
  if (input.parentId !== undefined) {
    if (input.parentId) {
      const parent = await db.vaultFolder.findFirst({
        where: { id: input.parentId, ownerId, deletedAt: null },
        select: { id: true },
      });
      if (!parent) throw errors.notFound("Parent folder not found.");
    }
  }

  // Check for duplicate name in new parent location
  const newParentId = input.parentId ?? folder.parentId;
  const newName = input.name ?? folder.name;
  if (newName !== folder.name || newParentId !== folder.parentId) {
    const existing = await db.vaultFolder.findFirst({
      where: {
        ownerId,
        parentId: newParentId ?? null,
        name: newName,
        deletedAt: null,
        NOT: { id },
      },
      select: { id: true },
    });
    if (existing) throw errors.conflict("A folder with this name already exists in this location.");
  }

  const data: Prisma.VaultFolderUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.parentId !== undefined) {
    data.parent = input.parentId ? { connect: { id: input.parentId } } : { disconnect: true };
  }

  const updated = await db.vaultFolder.update({
    where: { id },
    data,
    select: vaultFolderSelect,
  });
  await recordActivity(ownerId, "FOLDER_UPDATED", "Folder updated", {
    subjectType: "folder",
    subjectId: id,
  });
  return updated;
}

export async function deleteFolder(ownerId: string, id: string): Promise<void> {
  const db = getDb();
  const folder = await db.vaultFolder.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: { id: true },
  });
  if (!folder) throw errors.notFound("Folder not found.");

  // Soft delete: mark folder as deleted
  await db.vaultFolder.update({
    where: { id: folder.id },
    data: { deletedAt: new Date() },
  });
  
  // Also soft delete all files in this folder
  await db.vaultFile.updateMany({
    where: { ownerId, folderId: folder.id },
    data: { deletedAt: new Date() },
  });

  await recordActivity(ownerId, "FOLDER_DELETED", "Folder deleted", {
    subjectType: "folder",
    subjectId: folder.id,
  });
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export async function listFiles(
  ownerId: string,
  query: z.infer<typeof listFilesQuery>,
): Promise<Page<{ id: string; updatedAt: Date }>> {
  const db = getDb();
  const where: Prisma.VaultFileWhereInput = {
    ownerId,
    deletedAt: null,
    folderId: query.folderId ?? null,
    ...(query.status?.length ? { status: { in: query.status } } : {}),
    ...(query.scanStatus?.length ? { scanStatus: { in: query.scanStatus } } : {}),
    ...(query.star !== undefined ? { isStarred: query.star } : {}),
    ...(query.q ? { name: { contains: query.q, mode: "insensitive" } } : {}),
    ...(cursorWhere("updatedAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.vaultFile.findMany({
    where,
    orderBy: orderByWithCursor("updatedAt", "desc"),
    take: query.limit + 1,
    select: vaultFileSelect,
  });
  return toPage(rows, query.limit, (row) => row.updatedAt.toISOString());
}

export async function getFile(ownerId: string, id: string) {
  const file = await getDb().vaultFile.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: vaultFileSelect,
  });
  if (!file) throw errors.notFound("File not found.");
  return file;
}

export async function createUploadIntent(ownerId: string, input: z.infer<typeof fileUploadIntentInput>) {
  const db = getDb();
  const env = (await import("@/lib/config/env")).getEnv();
  
  // Validate folder exists and belongs to owner
  if (input.folderId) {
    const folder = await db.vaultFolder.findFirst({
      where: { id: input.folderId, ownerId, deletedAt: null },
      select: { id: true },
    });
    if (!folder) throw errors.notFound("Folder not found.");
  }

  // Check quota
  const usage = await db.storageUsage.upsert({
    where: { userId: ownerId },
    create: { userId: ownerId, usedBytes: BigInt(0), fileCount: 0 },
    update: {},
  });
  
  const maxQuota = env.DEFAULT_STORAGE_QUOTA_BYTES;
  if (usage.usedBytes + BigInt(input.sizeBytes) > BigInt(maxQuota)) {
    throw errors.payloadTooLarge("Storage quota exceeded.");
  }

  // Validate file type
  if (!declaredUploadAllowed(input.mimeType, input.name)) {
    throw errors.unsupportedMedia(`File type not allowed: ${input.mimeType}`);
  }

  // Generate storage key
  const storageKey = generateStorageKey(ownerId, input.mimeType);

  // Create pending file record
  const file = await db.vaultFile.create({
    data: {
      owner: { connect: { id: ownerId } },
      folder: input.folderId ? { connect: { id: input.folderId } } : undefined,
      name: input.name,
      storageKey,
      mimeType: input.mimeType,
      sizeBytes: BigInt(input.sizeBytes),
      status: "PENDING",
      scanStatus: "PENDING",
      expectedSizeBytes: BigInt(input.sizeBytes),
      expectedMimeType: input.mimeType,
    },
    select: {
      id: true,
      storageKey: true,
      expectedSizeBytes: true,
    },
  });

  // For Phase 2 with local storage, we return the file ID and the client will upload directly
  // In a real S3 implementation, we would generate a presigned PUT URL
  return {
    id: file.id,
    storageKey: file.storageKey,
    expectedSizeBytes: Number(file.expectedSizeBytes),
    uploadUrl: null, // Will be handled by direct upload to server in Phase 2
  };
}

export async function completeUpload(
  ownerId: string,
  input: z.infer<typeof fileUploadCompleteInput>,
): Promise<{ id: string; status: string; scanStatus: string }> {
  const db = getDb();
  const file = await db.vaultFile.findFirst({
    where: { id: input.uploadId, ownerId, deletedAt: null },
    select: {
      id: true,
      storageKey: true,
      expectedSizeBytes: true,
      expectedMimeType: true,
      status: true,
      scanStatus: true,
      checksumSha256: true,
    },
  });
  if (!file) throw errors.notFound("Upload not found.");

  if (file.status === "AVAILABLE" && file.scanStatus === "CLEAN") {
    return { id: file.id, status: file.status, scanStatus: file.scanStatus };
  }
  // Completion is now performed atomically by storeUpload after object
  // verification and scanning. This legacy endpoint is confirmation-only;
  // it must never promote a pending/quarantined record or increment quota.
  throw errors.preconditionFailed("Upload content must be sent through the server upload endpoint and pass scanning.");
}

/**
 * Store and scan a multipart upload through the application server. This is
 * intentionally the only upload path for local development and keeps the S3
 * provider replaceable without trusting browser-controlled metadata.
 */
export async function storeUpload(ownerId: string, uploadId: string, data: Buffer, declaredMime: string, filename: string) {
  const db = getDb();
  const file = await db.vaultFile.findFirst({
    where: { id: uploadId, ownerId, deletedAt: null },
    select: { id: true, storageKey: true, name: true, mimeType: true, expectedMimeType: true, expectedSizeBytes: true, status: true },
  });
  if (!file) throw errors.notFound("Upload not found.");
  if (file.status === "AVAILABLE") return { id: file.id, status: "AVAILABLE", scanStatus: "CLEAN" };
  if (file.status !== "PENDING" && file.status !== "UPLOADING") {
    throw errors.preconditionFailed("This upload is no longer accepting content.");
  }
  const env = (await import("@/lib/config/env")).getEnv();
  if (data.length > env.MAX_UPLOAD_BYTES || data.length !== Number(file.expectedSizeBytes)) {
    throw errors.badRequest("Uploaded content does not match the upload intent.");
  }
  if (declaredMime !== (file.expectedMimeType ?? file.mimeType)) {
    throw errors.badRequest("Uploaded content type does not match the upload intent.");
  }

  const storage = getObjectStorage();
  const stored = await storage.put(file.storageKey, data, { contentType: file.mimeType, maxBytes: env.MAX_UPLOAD_BYTES });
  const head = await storage.head(file.storageKey);
  if (!head || head.size !== data.length) throw errors.badRequest("Stored object verification failed.");

  const verdict = await scanUpload(data, file.mimeType, filename || file.name);
  if (verdict.status !== "CLEAN") {
    await db.vaultFile.update({
      where: { id: file.id },
      data: { status: "QUARANTINED", scanStatus: verdict.status, scanEngine: verdict.engine, scanMessage: verdict.message, scannedAt: new Date(), checksumSha256: stored.checksumSha256 },
    });
    return { id: file.id, status: "QUARANTINED", scanStatus: verdict.status };
  }

  const result = await db.$transaction(async (tx) => {
    const claimed = await tx.vaultFile.updateMany({
      where: { id: file.id, ownerId, status: { in: ["PENDING", "UPLOADING"] } },
      data: { status: "AVAILABLE", scanStatus: "CLEAN", scanEngine: verdict.engine, scanMessage: verdict.message, scannedAt: new Date(), checksumSha256: stored.checksumSha256, sizeBytes: BigInt(data.length) },
    });
    if (claimed.count === 0) return false;
    await tx.storageUsage.upsert({
      where: { userId: ownerId },
      create: { userId: ownerId, usedBytes: BigInt(data.length), fileCount: 1 },
      update: { usedBytes: { increment: BigInt(data.length) }, fileCount: { increment: 1 } },
    });
    return true;
  });
  if (result) await recordActivity(ownerId, "FILE_UPLOADED", "File uploaded", { subjectType: "file", subjectId: file.id });
  return { id: file.id, status: "AVAILABLE", scanStatus: "CLEAN" };
}

export async function updateFile(ownerId: string, id: string, input: z.infer<typeof fileUpdateInput>) {
  const db = getDb();
  const file = await db.vaultFile.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: { id: true, folderId: true, name: true },
  });
  if (!file) throw errors.notFound("File not found.");

  // Validate folder exists and belongs to owner (if changing folder)
  if (input.folderId !== undefined) {
    if (input.folderId) {
      const folder = await db.vaultFolder.findFirst({
        where: { id: input.folderId, ownerId, deletedAt: null },
        select: { id: true },
      });
      if (!folder) throw errors.notFound("Folder not found.");
    }
  }

  const data: Prisma.VaultFileUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.folderId !== undefined) data.folder = input.folderId ? { connect: { id: input.folderId } } : { disconnect: true };
  if (input.isStarred !== undefined) data.isStarred = input.isStarred;

  const updated = await db.vaultFile.update({
    where: { id },
    data,
    select: vaultFileSelect,
  });
  return updated;
}

export async function deleteFile(ownerId: string, id: string): Promise<void> {
  const db = getDb();
  const file = await db.vaultFile.findFirst({
    where: { id, ownerId, deletedAt: null },
    select: { id: true, sizeBytes: true },
  });
  if (!file) throw errors.notFound("File not found.");

  // Soft delete
  await db.vaultFile.update({
    where: { id: file.id },
    data: { deletedAt: new Date() },
  });

  // Update storage usage
  await db.storageUsage.update({
    where: { userId: ownerId },
    data: {
      usedBytes: { decrement: file.sizeBytes },
      fileCount: { decrement: 1 },
    },
  });

  await recordActivity(ownerId, "FILE_DELETED", "File deleted", {
    subjectType: "file",
    subjectId: file.id,
  });
}

export async function getStorageUsage(userId: string) {
  const env = (await import("@/lib/config/env")).getEnv();
  const usage = await getDb().storageUsage.findUnique({
    where: { userId },
    select: { usedBytes: true, fileCount: true, quotaBytes: true },
  });
  return {
    usedBytes: Number(usage?.usedBytes ?? BigInt(0)),
    fileCount: usage?.fileCount ?? 0,
    quotaBytes: Number(usage?.quotaBytes ?? BigInt(env.DEFAULT_STORAGE_QUOTA_BYTES)),
  };
}

export async function getPresignedDownload(ownerId: string, fileId: string) {
  const file = await getFile(ownerId, fileId);
  if (file.status !== "AVAILABLE" || file.scanStatus !== "CLEAN") {
    throw errors.forbidden("File is not available for download.");
  }

  const storage = getObjectStorage();
  const url = await storage.presignDownload(file.storageKey, { ttlSeconds: 3600 });

  return {
    url: url.url,
    expiresAt: url.expiresAt,
    file: {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      sizeBytes: Number(file.sizeBytes),
    },
  };
}
