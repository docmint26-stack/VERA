import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { evidenceAddInput, addEvidence } from "@/server/modules/verification/service";

// POST /api/v1/verification/requests/:id/evidence - Add evidence to verification request
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: evidenceAddInput,
  handler: async (ctx) => addEvidence(ctx.user!.id, ctx.params.id, ctx.body),
});
