import { apiRoute, noContent } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await users.removeSocialLink(ctx.user!.id, ctx.params.id);
    return noContent();
  },
});
