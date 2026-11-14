import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as admin from "@/server/modules/admin/service";

// GET /api/v1/admin/users - List users
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: admin.userListQuery,
  handler: async (ctx) => {
    // Verify PLATFORM_ADMIN
    if (ctx.user!.role !== "PLATFORM_ADMIN") {
      throw new Error("Forbidden");
    }
    const page = await admin.listUsers(ctx.query);
    return page;
  },
});
