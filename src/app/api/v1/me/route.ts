import { z } from "zod";
import { apiRoute } from "@/lib/api/route";
import { limits } from "@/lib/api/limits";
import * as users from "@/server/modules/users/service";

const patchBody = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .max(40)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only.")
    .nullish(),
  headline: z.string().max(160).nullish(),
  bio: z.string().max(4000).nullish(),
  location: z.string().max(120).nullish(),
  occupation: z.string().max(120).nullish(),
});

export const GET = apiRoute({
  auth: "required",
  rateLimit: limits.api,
  handler: async (ctx) => users.getMe(ctx.user!.id),
});

export const PATCH = apiRoute({
  auth: "required",
  rateLimit: limits.write,
  body: patchBody,
  handler: async (ctx) => {
    const { name, slug, ...profile } = ctx.body;
    const identity = await users.updateIdentity(
      ctx.user!,
      { name, slug },
      { requestId: ctx.requestId, ip: ctx.ip, userAgent: ctx.headers.get("user-agent") ?? undefined },
    );
    const updatedProfile =
      Object.keys(profile).length > 0 ? await users.updateProfile(ctx.user!.id, profile) : null;
    return { identity, profile: updatedProfile };
  },
});
