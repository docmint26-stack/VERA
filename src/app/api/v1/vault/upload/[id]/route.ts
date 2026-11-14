import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { errors } from "@/lib/errors/app-error";
import * as vault from "@/server/modules/vault/service";
import { getEnv } from "@/lib/config/env";

// Multipart upload is intentionally proxied through the server. The route
// wrapper still authenticates, rate-limits, and assigns a request id; the
// handler validates the File payload before it reaches object storage.
export const POST = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  handler: async (ctx) => {
    const form = await ctx.req.formData();
    const value = form.get("file");
    if (!(value instanceof File)) throw errors.validation("A file field is required.");
    if (value.size < 1 || value.size > getEnv().MAX_UPLOAD_BYTES) throw errors.payloadTooLarge("File size is not allowed.");
    const bytes = Buffer.from(await value.arrayBuffer());
    return vault.storeUpload(ctx.user!.id, ctx.params.id, bytes, value.type || "application/octet-stream", value.name);
  },
});
