import { Readable } from "node:stream";
import { z } from "zod";
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import { errors } from "@/lib/errors/app-error";
import { getDb } from "@/server/db/client";
import { getObjectStorage } from "@/server/storage";

/** Local-provider download endpoint; authorization happens before streaming. */
export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  query: z.object({ key: z.string().min(1).max(500) }),
  handler: async (ctx) => {
    const file = await getDb().vaultFile.findFirst({
      where: { ownerId: ctx.user!.id, storageKey: ctx.query.key, deletedAt: null, status: "AVAILABLE", scanStatus: "CLEAN" },
      select: { name: true, mimeType: true, sizeBytes: true, storageKey: true },
    });
    if (!file) throw errors.notFound("File not found.");
    const stream = await getObjectStorage().getStream(file.storageKey);
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      headers: {
        "Content-Type": file.mimeType,
        "Content-Length": String(file.sizeBytes),
        "Content-Disposition": `attachment; filename="${file.name.replace(/["\r\n]/g, "_")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
});
