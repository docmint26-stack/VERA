import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as achievements from "@/server/modules/achievements/service";

// POST /api/v1/achievements/:id/evidence - Add evidence
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: achievements.evidenceAddInput,
  handler: async (ctx) => {
    const evidence = await achievements.addEvidence(ctx.user!.id, ctx.params.id, ctx.body);
    return evidence;
  },
});
