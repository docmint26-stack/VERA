import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as achievements from "@/server/modules/achievements/service";

// POST /api/v1/achievements/:id/skills - Add skill
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: achievements.skillAddInput,
  handler: async (ctx) => {
    const skill = await achievements.addSkill(ctx.user!.id, ctx.params.id, ctx.body);
    return skill;
  },
});
