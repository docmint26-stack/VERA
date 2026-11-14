import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import {
  createRequestInput,
  listRequestsQuery,
  listRequests,
  createRequest,
} from "@/server/modules/verification/service";

// GET /api/v1/verification/requests - List verification requests for current user
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: listRequestsQuery,
  handler: async (ctx) => listRequests(ctx.user!.id, ctx.query),
});

// POST /api/v1/verification/requests - Create a new verification request
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: createRequestInput,
  handler: async (ctx) => createRequest(ctx.user!.id, ctx.body),
});
