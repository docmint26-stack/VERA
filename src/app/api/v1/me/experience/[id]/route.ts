import { apiRoute, noContent } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: users.experienceInput,
  handler: async (ctx) => users.updateExperience(ctx.user!.id, ctx.params.id, ctx.body),
});

export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await users.removeExperience(ctx.user!.id, ctx.params.id);
    return noContent();
  },
});
