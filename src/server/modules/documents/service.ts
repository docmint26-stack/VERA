import { z } from "zod";
import { errors } from "@/lib/errors/app-error";
import { cursorWhere, orderByWithCursor, paginationQuery, toPage, type Page } from "@/lib/api/pagination";
import { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/server/db/client";
import { recordActivity } from "@/server/modules/common";

/**
 * Documents: owner-scoped CRUD, optimistic concurrency via `revision`,
 * autosave snapshots in `DocumentVersion` and builtin/custom templates.
 */

export const documentListQuery = paginationQuery.extend({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  q: z.string().max(200).optional(),
});

export const documentCreateInput = z.object({
  title: z.string().min(1).max(200),
  category: z.string().max(120).nullish(),
  content: z.unknown().optional(),
});

export const documentPatchInput = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().max(120).nullish(),
  content: z.unknown().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  expectedRevision: z.number().int().min(1).optional(),
});

export const versionCreateInput = z.object({
  note: z.string().max(400).optional(),
});

const documentListSelect = {
  id: true,
  title: true,
  category: true,
  status: true,
  wordCount: true,
  revision: true,
  currentVersion: true,
  createdAt: true,
  updatedAt: true,
  lastSavedAt: true,
} as const;

export function countWords(content: unknown): number {
  if (content === null || content === undefined) return 0;
  const json = JSON.stringify(content);
  if (!json) return 0;
  return json.split(/\s+/).filter(Boolean).length;
}

function jsonInput(value: unknown): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
  return value === null || value === undefined ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
}

export async function listDocuments(
  userId: string,
  query: z.infer<typeof documentListQuery>,
): Promise<Page<{ id: string; updatedAt: Date }>> {
  const db = getDb();
  const where: Prisma.DocumentWhereInput = {
    ownerId: userId,
    isDeleted: false,
    ...(query.status ? { status: query.status } : {}),
    ...(query.q ? { title: { contains: query.q, mode: "insensitive" } } : {}),
    ...(cursorWhere("updatedAt", query.cursor, "desc") ?? {}),
  };
  const rows = await db.document.findMany({
    where,
    orderBy: orderByWithCursor("updatedAt", "desc"),
    take: query.limit + 1,
    select: documentListSelect,
  });
  return toPage(rows, query.limit, (row) => row.updatedAt.toISOString());
}

export async function createDocument(userId: string, input: z.infer<typeof documentCreateInput>) {
  const db = getDb();
  const data: Prisma.DocumentCreateInput = {
    owner: { connect: { id: userId } },
    title: input.title,
    category: input.category ?? null,
    wordCount: countWords(input.content),
    revision: 1,
    currentVersion: 1,
  };
  if (input.content !== undefined && input.content !== null) {
    data.content = input.content as Prisma.InputJsonValue;
  }
  const doc = await db.document.create({ data });
  await recordActivity(userId, "DOCUMENT_CREATED", "Document created", {
    subjectType: "document",
    subjectId: doc.id,
  });
  return doc;
}

export async function getDocument(userId: string, id: string) {
  const doc = await getDb().document.findFirst({
    where: { id, ownerId: userId, isDeleted: false },
    select: { ...documentListSelect, content: true },
  });
  if (!doc) throw errors.notFound("Document not found.");
  return doc;
}

export async function updateDocument(userId: string, id: string, input: z.infer<typeof documentPatchInput>) {
  const db = getDb();
  const doc = await db.document.findFirst({ where: { id, ownerId: userId, isDeleted: false } });
  if (!doc) throw errors.notFound("Document not found.");
  if (input.expectedRevision !== undefined && input.expectedRevision !== doc.revision) {
    throw errors.preconditionFailed("The document changed since you loaded it.", { currentRevision: doc.revision });
  }

  const contentChanged =
    input.content !== undefined && JSON.stringify(input.content ?? null) !== JSON.stringify(doc.content ?? null);

  const data: Prisma.DocumentUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.category !== undefined) data.category = input.category ?? null;
  if (input.status !== undefined) data.status = input.status;
  if (contentChanged) {
    data.content = jsonInput(input.content);
    data.wordCount = countWords(input.content);
    data.revision = doc.revision + 1;
    data.currentVersion = doc.currentVersion + 1;
    data.lastSavedAt = new Date();
  }
  if (Object.keys(data).length === 0) return doc;

  return db.$transaction(async (tx) => {
    const updated = await tx.document.update({ where: { id: doc.id }, data });
    if (contentChanged) {
      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          version: doc.currentVersion + 1,
          title: updated.title,
          content: jsonInput(updated.content),
          wordCount: updated.wordCount,
          note: "autosave",
          createdById: userId,
        },
      });
    }
    return updated;
  });
}

export async function deleteDocument(userId: string, id: string): Promise<void> {
  const db = getDb();
  const doc = await db.document.findFirst({ where: { id, ownerId: userId, isDeleted: false }, select: { id: true } });
  if (!doc) throw errors.notFound("Document not found.");
  await db.document.update({ where: { id: doc.id }, data: { isDeleted: true, deletedAt: new Date() } });
  await recordActivity(userId, "DOCUMENT_DELETED", "Document deleted", {
    subjectType: "document",
    subjectId: doc.id,
  });
}

export async function publishDocument(userId: string, id: string) {
  const db = getDb();
  const doc = await db.document.findFirst({ where: { id, ownerId: userId, isDeleted: false } });
  if (!doc) throw errors.notFound("Document not found.");
  if (doc.status === "PUBLISHED") return doc;
  return db.document.update({ where: { id: doc.id }, data: { status: "PUBLISHED" } });
}

export async function listDocumentVersions(userId: string, id: string) {
  const db = getDb();
  const doc = await db.document.findFirst({ where: { id, ownerId: userId, isDeleted: false }, select: { id: true } });
  if (!doc) throw errors.notFound("Document not found.");
  return db.documentVersion.findMany({
    where: { documentId: doc.id },
    orderBy: { version: "desc" },
    select: { id: true, version: true, title: true, wordCount: true, note: true, createdAt: true },
  });
}

export async function createDocumentVersion(userId: string, id: string, input: z.infer<typeof versionCreateInput>) {
  const db = getDb();
  const doc = await db.document.findFirst({ where: { id, ownerId: userId, isDeleted: false } });
  if (!doc) throw errors.notFound("Document not found.");
  const version = doc.currentVersion + 1;
  return db.$transaction(async (tx) => {
    const row = await tx.documentVersion.create({
      data: {
        documentId: doc.id,
        version,
        title: doc.title,
        content: jsonInput(doc.content),
        wordCount: doc.wordCount,
        note: input.note ?? "manual",
        createdById: userId,
      },
    });
    await tx.document.update({ where: { id: doc.id }, data: { currentVersion: version } });
    return row;
  });
}

export async function restoreDocumentVersion(userId: string, id: string, versionParam: string) {
  const version = Number.parseInt(versionParam, 10);
  if (!Number.isInteger(version) || version < 1) throw errors.validation("Invalid version number.");
  const db = getDb();
  const doc = await db.document.findFirst({ where: { id, ownerId: userId, isDeleted: false } });
  if (!doc) throw errors.notFound("Document not found.");
  const snapshot = await db.documentVersion.findFirst({ where: { documentId: doc.id, version } });
  if (!snapshot) throw errors.notFound("Version not found.");

  const preRestoreVersion = doc.currentVersion + 1;
  return db.$transaction(async (tx) => {
    await tx.documentVersion.create({
      data: {
        documentId: doc.id,
        version: preRestoreVersion,
        title: doc.title,
        content: jsonInput(doc.content),
        wordCount: doc.wordCount,
        note: "pre-restore",
        createdById: userId,
      },
    });
    return tx.document.update({
      where: { id: doc.id },
      data: {
        title: snapshot.title,
        content: jsonInput(snapshot.content),
        wordCount: countWords(snapshot.content),
        revision: doc.revision + 1,
        lastSavedAt: new Date(),
        currentVersion: preRestoreVersion,
      },
    });
  });
}

export interface BuiltinTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isBuiltin: boolean;
  content: null;
}

export const builtinTemplates: BuiltinTemplate[] = [
  {
    id: "builtin-cover-letter",
    name: "Cover Letter",
    description: "A focused letter that matches your experience to a specific role.",
    category: "Career",
    isBuiltin: true,
    content: null,
  },
  {
    id: "builtin-project-report",
    name: "Project Report",
    description: "Structured report with goals, timeline, deliverables and outcomes.",
    category: "Business",
    isBuiltin: true,
    content: null,
  },
  {
    id: "builtin-research-summary",
    name: "Research Summary",
    description: "Abstract-style summary covering problem, method, findings and impact.",
    category: "Academic",
    isBuiltin: true,
    content: null,
  },
  {
    id: "builtin-personal-statement",
    name: "Personal Statement",
    description: "Narrative statement for applications: motivation, strengths and goals.",
    category: "Career",
    isBuiltin: true,
    content: null,
  },
];

export async function listTemplates(userId: string) {
  const custom = await getDb().documentTemplateReference.findMany({
    where: { isBuiltin: false, createdById: userId },
    orderBy: { createdAt: "desc" },
  });
  return [...builtinTemplates, ...custom];
}
