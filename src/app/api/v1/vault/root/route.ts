import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault/root - Get root folder
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const root = await vault.getRootFolder(ctx.user!.id);
    return root;
  },
});
