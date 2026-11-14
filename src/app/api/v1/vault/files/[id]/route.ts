
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault/files/:id - Get file metadata
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const file = await vault.getFile(ctx.user!.id, ctx.params.id);
    return file;
  },
});

// PATCH /api/v1/vault/files/:id - Update file metadata
const patchBody = vault.fileUpdateInput;

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: patchBody,
  handler: async (ctx) => {
    const file = await vault.updateFile(ctx.user!.id, ctx.params.id, ctx.body);
    return file;
  },
});

// DELETE /api/v1/vault/files/:id - Delete file
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await vault.deleteFile(ctx.user!.id, ctx.params.id);
    return { deleted: true };
  },
});
