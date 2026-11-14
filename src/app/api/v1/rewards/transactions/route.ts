import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { listTransactionsQuery, listTransactions } from "@/server/modules/rewards/service";

// GET /api/v1/rewards/transactions - List reward transactions
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: listTransactionsQuery,
  handler: async (ctx) => listTransactions(ctx.user!.id, ctx.query),
});
