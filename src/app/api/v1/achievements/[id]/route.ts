import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as achievements from "@/server/modules/achievements/service";

// GET /api/v1/achievements/:id - Get achievement
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const achievement = await achievements.getAchievement(ctx.user!.id, ctx.params.id);
    return achievement;
  },
});

// PATCH /api/v1/achievements/:id - Update achievement
export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: achievements.achievementUpdateInput,
  handler: async (ctx) => {
    const achievement = await achievements.updateAchievement(ctx.user!.id, ctx.params.id, ctx.body);
    return achievement;
  },
});

// DELETE /api/v1/achievements/:id - Delete achievement
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await achievements.deleteAchievement(ctx.user!.id, ctx.params.id);
    return { deleted: true };
  },
});
