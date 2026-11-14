import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// POST /api/v1/organizations/invitations/:token/accept - Accept invitation
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    const result = await organizations.acceptInvitation(ctx.params.token, ctx.user!.id);
    return result;
  },
});
