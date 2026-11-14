import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { getTransaction } from "@/server/modules/rewards/service";

// GET /api/v1/rewards/transactions/:id - Get reward transaction by ID
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const transaction = await getTransaction(ctx.user!.id, ctx.params.id);
    return transaction;
  },
});
