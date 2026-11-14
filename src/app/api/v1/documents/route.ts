
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as documents from "@/server/modules/documents/service";

// GET /api/v1/documents - List documents
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: documents.documentListQuery,
  handler: async (ctx) => {
    const page = await documents.listDocuments(ctx.user!.id, ctx.query);
    return page;
  },
});

// POST /api/v1/documents - Create document
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: documents.documentCreateInput,
  handler: async (ctx) => {
    const doc = await documents.createDocument(ctx.user!.id, ctx.body);
    return doc;
  },
});
