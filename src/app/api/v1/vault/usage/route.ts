import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// GET /api/v1/vault/usage - Get storage usage
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const usage = await vault.getStorageUsage(ctx.user!.id);
    return usage;
  },
});
