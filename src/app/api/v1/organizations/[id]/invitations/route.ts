import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// GET /api/v1/organizations/:id/invitations - List invitations
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const invitations = await organizations.listInvitations(ctx.params.id, ctx.user!.id);
    return invitations;
  },
});

// POST /api/v1/organizations/:id/invitations - Create invitation
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: organizations.invitationCreateInput,
  handler: async (ctx) => {
    const invitation = await organizations.createInvitation(ctx.params.id, ctx.user!.id, ctx.body);
    return invitation;
  },
});
