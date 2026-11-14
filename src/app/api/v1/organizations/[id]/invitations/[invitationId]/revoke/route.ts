import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// POST /api/v1/organizations/:id/invitations/:invitationId/revoke - Revoke invitation
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await organizations.revokeInvitation(ctx.params.id, ctx.params.invitationId, ctx.user!.id);
    return { revoked: true };
  },
});
