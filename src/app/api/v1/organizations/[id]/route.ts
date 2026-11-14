import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as organizations from "@/server/modules/organizations/service";

// GET /api/v1/organizations/:id - Get organization
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const org = await organizations.getOrganization(ctx.params.id, ctx.user!.id);
    return org;
  },
});

// PATCH /api/v1/organizations/:id - Update organization
export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: organizations.orgUpdateInput,
  handler: async (ctx) => {
    const org = await organizations.updateOrganization(ctx.params.id, ctx.user!.id, ctx.body);
    return org;
  },
});

// DELETE /api/v1/organizations/:id - Delete organization
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await organizations.deleteOrganization(ctx.params.id, ctx.user!.id);
    return { deleted: true };
  },
});
