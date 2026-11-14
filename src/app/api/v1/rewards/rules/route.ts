import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { listRules } from "@/server/modules/rewards/service";

// GET /api/v1/rewards/rules - List all reward rules
export const GET = apiRoute({
  auth: "none",
  rateLimit: limits.publicRead,
  handler: async () => {
    const rules = await listRules();
    return { rules };
  },
});
