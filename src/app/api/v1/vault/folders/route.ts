
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault/folders - List folders
const listQuery = vault.listFoldersQuery;

export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: listQuery,
  handler: async (ctx) => {
    const page = await vault.listFolders(ctx.user!.id, ctx.query);
    return page;
  },
});

// POST /api/v1/vault/folders - Create folder
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: vault.folderCreateInput,
  handler: async (ctx) => {
    const folder = await vault.createFolder(ctx.user!.id, ctx.body);
    return folder;
  },
});
