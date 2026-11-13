import { apiRoute, created } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => users.listSkills(ctx.user!.id),
});

export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: users.skillInput,
  handler: async (ctx) => created(await users.addSkill(ctx.user!.id, ctx.body)),
});
