import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// GET /api/v1/organizations/:id/members/:memberId - Get member
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const member = await organizations.getMember(ctx.params.id, ctx.params.memberId, ctx.user!.id);
    return member;
  },
});

// PATCH /api/v1/organizations/:id/members/:memberId - Update member role
export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: organizations.memberUpdateInput,
  handler: async (ctx) => {
    const result = await organizations.updateMemberRole(
      ctx.params.id,
      ctx.params.memberId,
      ctx.user!.id,
      ctx.body,
    );
    return result;
  },
});

// DELETE /api/v1/organizations/:id/members/:memberId - Remove member
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await organizations.removeMember(ctx.params.id, ctx.params.memberId, ctx.user!.id);
    return { deleted: true };
  },
});
