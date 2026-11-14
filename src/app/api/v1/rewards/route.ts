import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { listTransactionsQuery, getRewardAccount } from "@/server/modules/rewards/service";

// GET /api/v1/rewards - Get reward account
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: listTransactionsQuery,
  handler: async (ctx) => {
    const account = await getRewardAccount(ctx.user!.id);
    return { account };
  },
});
