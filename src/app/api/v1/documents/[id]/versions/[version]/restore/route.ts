import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as documents from "@/server/modules/documents/service";

// POST /api/v1/documents/:id/versions/:version/restore - Restore document version
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    const doc = await documents.restoreDocumentVersion(ctx.user!.id, ctx.params.id, ctx.params.version);
    return doc;
  },
});
