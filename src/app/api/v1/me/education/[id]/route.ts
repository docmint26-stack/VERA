import { apiRoute, noContent } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: users.educationInput,
  handler: async (ctx) => users.updateEducation(ctx.user!.id, ctx.params.id, ctx.body),
});

export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await users.removeEducation(ctx.user!.id, ctx.params.id);
    return noContent();
  },
});
