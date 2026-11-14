import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as admin from "@/server/modules/admin/service";

// GET /api/v1/admin/users/:id - Get user
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    if (ctx.user!.role !== "PLATFORM_ADMIN") {
      throw new Error("Forbidden");
    }
    const user = await admin.getUser(ctx.params.id);
    return user;
  },
});

// PATCH /api/v1/admin/users/:id - Update user
export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: admin.userUpdateInput,
  handler: async (ctx) => {
    if (ctx.user!.role !== "PLATFORM_ADMIN") {
      throw new Error("Forbidden");
    }
    const user = await admin.updateUser(ctx.params.id, ctx.user!.id, ctx.body);
    return user;
  },
});
