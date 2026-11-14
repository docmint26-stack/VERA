import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as achievements from "@/server/modules/achievements/service";

// GET /api/v1/achievements - List achievements
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: achievements.listQuery,
  handler: async (ctx) => {
    const page = await achievements.listAchievements(ctx.user!.id, ctx.query);
    return page;
  },
});

// POST /api/v1/achievements - Create achievement
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: achievements.achievementCreateInput,
  handler: async (ctx) => {
    const achievement = await achievements.createAchievement(ctx.user!.id, ctx.body);
    return achievement;
  },
});
