import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import {
  updateRequestInput,
  getRequest,
  updateRequest,
  cancelRequest,
} from "@/server/modules/verification/service";

// GET /api/v1/verification/requests/:id - Get verification request by ID
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => getRequest(ctx.user!.id, ctx.params.id),
});

// PATCH /api/v1/verification/requests/:id - Update verification request
export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: updateRequestInput,
  handler: async (ctx) => updateRequest(ctx.user!.id, ctx.params.id, ctx.body),
});

// DELETE /api/v1/verification/requests/:id - Cancel verification request
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await cancelRequest(ctx.user!.id, ctx.params.id);
    return null;
  },
});
