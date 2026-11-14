import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as notifications from "@/server/modules/notifications/service";

// GET /api/v1/notifications - List notifications
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: notifications.listQuery,
  handler: async (ctx) => {
    const page = await notifications.listNotifications(ctx.user!.id, ctx.query);
    return page;
  },
});

// POST /api/v1/notifications/mark-all-read - Mark all as read
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    const result = await notifications.markAllAsRead(ctx.user!.id);
    return result;
  },
});
