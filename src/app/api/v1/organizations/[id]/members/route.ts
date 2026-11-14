import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// GET /api/v1/organizations/:id/members - List members
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: organizations.listMemberQuery,
  handler: async (ctx) => {
    const page = await organizations.listMembers(ctx.params.id, ctx.user!.id, ctx.query);
    return page;
  },
});
