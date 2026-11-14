
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault/folders/:id - Get folder
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const folder = await vault.getFolder(ctx.user!.id, ctx.params.id);
    return folder;
  },
});

// PATCH /api/v1/vault/folders/:id - Update folder
const patchBody = vault.folderUpdateInput;

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: patchBody,
  handler: async (ctx) => {
    const folder = await vault.updateFolder(ctx.user!.id, ctx.params.id, ctx.body);
    return folder;
  },
});

// DELETE /api/v1/vault/folders/:id - Delete folder
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await vault.deleteFolder(ctx.user!.id, ctx.params.id);
    return { deleted: true };
  },
});
