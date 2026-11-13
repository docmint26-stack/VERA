import { connection } from "next/server";
import { getEnv } from "@/lib/config/env";
import { getDb } from "@/server/db/client";
import { getRateLimiter } from "@/server/security/rate-limit";

/**
 * Readiness probe — verifies the database answers and reports coarse
 * component state. Detailed diagnostics are only exposed when
 * EXPOSE_HEALTH_DETAILS=1 (never in production).
 */
interface Check {
  name: string;
  ok: boolean;
  durationMs: number;
  detail?: string;
}

async function check(name: string, fn: () => Promise<void>): Promise<Check> {
  const started = Date.now();
  try {
    await fn();
    return { name, ok: true, durationMs: Date.now() - started };
  } catch (error) {
    return {
      name,
      ok: false,
      durationMs: Date.now() - started,
      detail: error instanceof Error ? error.message.slice(0, 200) : "unknown error",
    };
  }
}

export async function GET(): Promise<Response> {
  await connection();
  const checks: Check[] = [];

  checks.push(
    await check("database", async () => {
      await getDb().$queryRaw`SELECT 1`;
    }),
  );

  checks.push(
    await check("rate-limiter", async () => {
      const limiter = getRateLimiter();
      if (!limiter.driver) throw new Error("no driver");
    }),
  );

  const ok = checks.every((c) => c.ok);
  const exposeDetails = getEnv().EXPOSE_HEALTH_DETAILS;

  return Response.json(
    {
      status: ok ? "ready" : "not-ready",
      checks: exposeDetails ? checks : checks.map(({ name, ok: passed }) => ({ name, ok: passed })),
      ...(exposeDetails ? { nodeEnv: getEnv().NODE_ENV } : {}),
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
