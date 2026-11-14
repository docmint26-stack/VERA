
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as documents from "@/server/modules/documents/service";

// GET /api/v1/documents/:id - Get document
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const doc = await documents.getDocument(ctx.user!.id, ctx.params.id);
    return doc;
  },
});

// PATCH /api/v1/documents/:id - Update document
const patchBody = documents.documentPatchInput;

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: patchBody,
  handler: async (ctx) => {
    const doc = await documents.updateDocument(ctx.user!.id, ctx.params.id, ctx.body);
    return doc;
  },
});

// DELETE /api/v1/documents/:id - Delete document
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await documents.deleteDocument(ctx.user!.id, ctx.params.id);
    return { deleted: true };
  },
});
