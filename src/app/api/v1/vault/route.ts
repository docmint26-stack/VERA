
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault - List files in vault
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

// POST /api/v1/vault/upload-intents - Create upload intent
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: vault.fileUploadIntentInput,
  handler: async (ctx) => {
    const intent = await vault.createUploadIntent(ctx.user!.id, ctx.body);
    return intent;
  },
});
