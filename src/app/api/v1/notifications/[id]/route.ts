import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as notifications from "@/server/modules/notifications/service";

// GET /api/v1/notifications/:id - Get notification
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const notification = await notifications.getNotification(ctx.user!.id, ctx.params.id);
    return notification;
  },
});

// PATCH /api/v1/notifications/:id/mark-read - Mark as read
export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    const result = await notifications.markAsRead(ctx.user!.id, ctx.params.id);
    return result;
  },
});

// DELETE /api/v1/notifications/:id - Delete notification
export const DELETE = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    await notifications.deleteNotification(ctx.user!.id, ctx.params.id);
    return { deleted: true };
  },
});
