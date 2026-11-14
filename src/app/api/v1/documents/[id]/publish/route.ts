import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as documents from "@/server/modules/documents/service";

// POST /api/v1/documents/:id/publish - Publish document
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    const doc = await documents.publishDocument(ctx.user!.id, ctx.params.id);
    return doc;
  },
});
