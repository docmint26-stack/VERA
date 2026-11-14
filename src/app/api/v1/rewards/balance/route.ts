import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { getBalance } from "@/server/modules/rewards/service";

// GET /api/v1/rewards/balance - Get balance only (lightweight)
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => getBalance(ctx.user!.id),
});
