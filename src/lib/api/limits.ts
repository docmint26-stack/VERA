import type { RateLimitRuleConfig } from "@/server/security/rate-limit";

/**
 * Shared rate-limit profiles. Route handlers reference these instead of
 * inventing numbers, so limits are consistent and easy to audit.
 */
export const limits = {
  /** Default for authenticated CRUD traffic. */
  api: { scope: "api", limit: 240, windowSeconds: 60, by: "user" } satisfies RateLimitRuleConfig,
  /** Unauthenticated reads (public profile, share links). */
  publicRead: { scope: "public-read", limit: 120, windowSeconds: 60 } satisfies RateLimitRuleConfig,
  /** Mutations that create rows. */
  write: { scope: "write", limit: 60, windowSeconds: 60, by: "user" } satisfies RateLimitRuleConfig,
  /** Uploads are expensive. */
  upload: { scope: "upload", limit: 30, windowSeconds: 60, by: "user" } satisfies RateLimitRuleConfig,
  /** Account creation. */
  signUp: { scope: "sign-up", limit: 10, windowSeconds: 3600 } satisfies RateLimitRuleConfig,
  /** Admin surface. */
  admin: { scope: "admin", limit: 120, windowSeconds: 60, by: "user" } satisfies RateLimitRuleConfig,
} as const;
