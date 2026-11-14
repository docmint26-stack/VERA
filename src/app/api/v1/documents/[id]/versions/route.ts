import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as documents from "@/server/modules/documents/service";

// GET /api/v1/documents/:id/versions - List document versions
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => {
    const versions = await documents.listDocumentVersions(ctx.user!.id, ctx.params.id);
    return versions;
  },
});

// POST /api/v1/documents/:id/versions - Create manual version
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: documents.versionCreateInput,
  handler: async (ctx) => {
    const version = await documents.createDocumentVersion(ctx.user!.id, ctx.params.id, ctx.body);
    return version;
  },
});
