import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// GET /api/v1/organizations - List organizations
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: organizations.listOrgQuery,
  handler: async (ctx) => {
    const page = await organizations.listOrganizations(ctx.user!.id, ctx.query);
    return page;
  },
});

// POST /api/v1/organizations - Create organization
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: organizations.orgCreateInput,
  handler: async (ctx) => {
    const org = await organizations.createOrganization(ctx.user!.id, ctx.body);
    return org;
  },
});
