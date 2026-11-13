import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

/** Public profile by slug — honours the owner's privacy settings. */
export const GET = apiRoute({
  auth: "optional",
  rateLimit: limits.publicRead,
  handler: async (ctx) => users.getPublicProfile(ctx.params.slug, ctx.user?.id ?? null),
});
