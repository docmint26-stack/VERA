
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault/files - List files
const listQuery = vault.listFilesQuery;

export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: listQuery,
  handler: async (ctx) => {
    const page = await vault.listFiles(ctx.user!.id, ctx.query);
    return page;
  },
});
