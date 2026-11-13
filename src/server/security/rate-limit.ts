import { getEnv, trustProxy } from "@/lib/config/env";
import { errors } from "@/lib/errors/app-error";
import { logger } from "@/server/observability/logger";
import { getDb } from "@/server/db/client";
import type { NextRequest } from "next/server";

/**
 * Distributed rate limiting.
 *
 * Drivers (selected by RATE_LIMIT_DRIVER):
 *   db      — atomic PostgreSQL upsert (default; zero extra infrastructure)
 *   upstash — Upstash Redis REST (free tier, works across serverless instances)
 *   memory  — process-local fallback (single-process dev only; never production)
 *
 * Every driver implements a single atomic `consume` step so concurrent
 * requests cannot race past a stale read.
 */

export interface ConsumeRule {
  window: number; // seconds
  max: number;
}

export interface ConsumeResult {
  allowed: boolean;
  retryAfter: number | null; // seconds
}

export interface RateLimiter {
  readonly driver: "db" | "upstash" | "memory";
  consume(key: string, rule: ConsumeRule): Promise<ConsumeResult>;
  reset(key?: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Driver: PostgreSQL (atomic, single statement)
// ---------------------------------------------------------------------------

function postgresLimiter(): RateLimiter {
  return {
    driver: "db",
    async consume(key, rule) {
      const db = getDb();
      const expiresAt = new Date(Date.now() + rule.window * 1000);
      const rows = await db.$queryRaw<{ value: number; expiresAt: Date }[]>`
        INSERT INTO "RateLimitEntry" ("key", "value", "expiresAt", "updatedAt")
        VALUES (${key}, 1, ${expiresAt}, now())
        ON CONFLICT ("key") DO UPDATE SET
          "value" = CASE WHEN "RateLimitEntry"."expiresAt" <= now() THEN 1 ELSE "RateLimitEntry"."value" + 1 END,
          "expiresAt" = CASE WHEN "RateLimitEntry"."expiresAt" <= now() THEN ${expiresAt} ELSE "RateLimitEntry"."expiresAt" END,
          "updatedAt" = now()
        RETURNING "value", "expiresAt"
      `;
      const row = rows[0];
      const allowed = row.value <= rule.max;
      const retryAfter = allowed
        ? null
        : Math.max(1, Math.ceil((row.expiresAt.getTime() - Date.now()) / 1000));
      return { allowed, retryAfter };
    },
    async reset(key) {
      const db = getDb();
      if (key) {
        await db.rateLimitEntry.deleteMany({ where: { key } });
      } else {
        await db.rateLimitEntry.deleteMany({});
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Driver: Upstash Redis REST (no SDK — plain fetch)
// ---------------------------------------------------------------------------

function upstashLimiter(): RateLimiter {
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = getEnv();
  const base = url.replace(/\/$/, "");

  async function command(cmd: (string | number)[]): Promise<unknown> {
    const response = await fetch(`${base}/command`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Upstash command failed with status ${response.status}`);
    }
    const data = (await response.json()) as { result: unknown };
    return data.result;
  }

  return {
    driver: "upstash",
    async consume(key, rule) {
      const redisKey = `vera:rl:${key}`;
      const value = (await command(["INCR", redisKey])) as number;
      if (value === 1) {
        await command(["EXPIRE", redisKey, rule.window]);
      } else if (value === rule.max + 1) {
        // Pin the window so the limit frees up predictably.
        await command(["EXPIRE", redisKey, rule.window, "NX"]);
      }
      const allowed = value <= rule.max;
      const ttl = (await command(["TTL", redisKey])) as number;
      return { allowed, retryAfter: allowed ? null : Math.max(1, ttl > 0 ? ttl : rule.window) };
    },
    async reset(key) {
      if (key) await command(["DEL", `vera:rl:${key}`]);
      else await command(["SCAN", 0, "MATCH", "vera:rl:*", "COUNT", 1000]);
    },
  };
}

// ---------------------------------------------------------------------------
// Driver: in-memory (development fallback)
// ---------------------------------------------------------------------------

interface MemoryEntry {
  count: number;
  resetAt: number;
}

function memoryLimiter(): RateLimiter {
  const store = new Map<string, MemoryEntry>();
  let warned = false;
  return {
    driver: "memory",
    async consume(key, rule) {
      if (!warned) {
        warned = true;
        logger.warn("rate-limit.memory-driver", {
          service: "security",
          note: "Using process-local rate limiting; set RATE_LIMIT_DRIVER=db (or upstash) for distributed limits.",
        });
      }
      const now = Date.now();
      const entry = store.get(key);
      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt: now + rule.window * 1000 });
        return { allowed: true, retryAfter: null };
      }
      entry.count += 1;
      const allowed = entry.count <= rule.max;
      return { allowed, retryAfter: allowed ? null : Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
    },
    async reset(key) {
      if (key) store.delete(key);
      else store.clear();
    },
  };
}

let cached: RateLimiter | null = null;

export function getRateLimiter(): RateLimiter {
  if (cached) return cached;
  const { RATE_LIMIT_DRIVER, RATE_LIMIT_ENABLED } = getEnv();
  if (!RATE_LIMIT_ENABLED) {
    cached = memoryLimiter();
  } else if (RATE_LIMIT_DRIVER === "upstash") {
    cached = upstashLimiter();
  } else if (RATE_LIMIT_DRIVER === "memory") {
    cached = memoryLimiter();
  } else {
    cached = postgresLimiter();
  }
  return cached;
}

/** Test/ops hook — forces the next call to rebuild the driver. */
export function resetRateLimiter(): void {
  cached = null;
}

// ---------------------------------------------------------------------------
// Client IP (only trusts forwarding headers when configured to)
// ---------------------------------------------------------------------------

export function clientIp(req: NextRequest): string {
  const env = getEnv();
  if (trustProxy(env)) {
    const forwarded = req.headers.get("x-forwarded-for");
    if (forwarded) {
      const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
      if (hops.length === 1) return hops[0];
      const trusted = env.TRUSTED_PROXY_IPS.split(",").map((s) => s.trim()).filter(Boolean);
      // Walk right-to-left, skipping trusted proxies; take the first untrusted hop.
      for (let i = hops.length - 1; i >= 0; i--) {
        if (!trusted.includes(hops[i])) return hops[i];
      }
      return hops[0];
    }
    const realIp = req.headers.get("x-real-ip");
    if (realIp) return realIp;
  }
  return "local";
}

// ---------------------------------------------------------------------------
// Enforcement helper for route handlers
// ---------------------------------------------------------------------------

export interface RateLimitRuleConfig {
  /** Stable key suffix, e.g. endpoint name. */
  scope: string;
  limit: number;
  windowSeconds: number;
  /** `ip` (default), `user`, or a custom key already scoped by the caller. */
  by?: "ip" | "user";
}

export async function enforceRateLimit(
  rule: RateLimitRuleConfig,
  context: { requestId: string; ip: string; userId?: string; email?: string },
): Promise<void> {
  const env = getEnv();
  if (!env.RATE_LIMIT_ENABLED) return;

  const identity =
    rule.by === "user"
      ? `u:${context.userId ?? "anon"}`
      : context.email
        ? `e:${context.email.toLowerCase()}`
        : `ip:${context.ip}`;

  const key = `${rule.scope}:${identity}`;
  const limiter = getRateLimiter();
  try {
    const result = await limiter.consume(key, { window: rule.windowSeconds, max: rule.limit });
    if (!result.allowed) {
      logger.warn("rate-limit.exceeded", {
        service: "security",
        operation: rule.scope,
        requestId: context.requestId,
        userId: context.userId,
      });
      throw errors.rateLimited(result.retryAfter ?? rule.windowSeconds);
    }
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "RATE_LIMITED") {
      throw error;
    }
    // Fail open on infrastructure errors but make them visible.
    logger.error("rate-limit.unavailable", { service: "security", operation: rule.scope, requestId: context.requestId, error });
  }
}

/**
 * Better Auth-compatible storage: atomic consume in one step.
 * Passed to `betterAuth({ rateLimit: { customStorage } })`.
 */
export const betterAuthRateLimitStorage = {
  consume: async (key: string, rule: ConsumeRule): Promise<ConsumeResult> => {
    const env = getEnv();
    if (!env.RATE_LIMIT_ENABLED) return { allowed: true, retryAfter: null };
    return getRateLimiter().consume(`ba:${key}`, rule);
  },
};
