
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as vault from "@/server/modules/vault/service";

// POST /api/v1/vault/upload/:id/complete - Complete upload
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: vault.fileUploadCompleteInput,
  handler: async (ctx) => {
    const result = await vault.completeUpload(ctx.user!.id, {
      uploadId: ctx.params.id,
      checksumSha256: ctx.body.checksumSha256,
      sizeBytes: ctx.body.sizeBytes,
    });
    return result;
  },
});
