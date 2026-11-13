import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const me = await users.getMe(ctx.user!.id);
    return me.preferences;
  },
});

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: users.preferencesInput,
  handler: async (ctx) => users.updatePreferences(ctx.user!.id, ctx.body),
});
