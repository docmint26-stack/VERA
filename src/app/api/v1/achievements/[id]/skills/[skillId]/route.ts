import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as achievements from "@/server/modules/achievements/service";

// DELETE /api/v1/achievements/:id/skills/:skillId - Remove skill
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await achievements.removeSkill(ctx.user!.id, ctx.params.id, ctx.params.skillId);
    return { deleted: true };
  },
});
