import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as admin from "@/server/modules/admin/service";

// GET /api/v1/admin/stats - Get system stats
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    if (ctx.user!.role !== "PLATFORM_ADMIN") {
      throw new Error("Forbidden");
    }
    const stats = await admin.getSystemStats();
    return {
      ...stats,
      totalStorageBytes: Number(stats.totalStorageBytes),
    };
  },
});
