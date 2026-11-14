import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { listCredentials } from "@/server/modules/verification/service";

// GET /api/v1/verification/credentials - List credentials for current user
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => listCredentials(ctx.user!.id),
});
