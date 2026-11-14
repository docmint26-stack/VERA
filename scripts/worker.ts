import { getEnv } from "@/lib/config/env";
import { closeDb } from "@/server/db/client";
import { completeOutbox, claimDueOutbox } from "@/server/email/send";
import { getEmailProvider, type EmailMessage } from "@/server/email/provider";
import { logger } from "@/server/observability/logger";

let stopping = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isEmailMessage(value: unknown): value is EmailMessage {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.from === "string" && Array.isArray(item.to) && item.to.every((x) => typeof x === "string") && typeof item.subject === "string" && typeof item.html === "string" && typeof item.text === "string";
}

async function processOnce(): Promise<number> {
  const entries = await claimDueOutbox(10);
  for (const entry of entries) {
    let result;
    if (entry.eventType !== "EMAIL_DELIVERY" || !isEmailMessage(entry.payload)) {
      result = { delivered: false, provider: "dev" as const, error: "invalid outbox payload" };
    } else {
      try {
        result = await getEmailProvider().send(entry.payload);
      } catch (error) {
        result = { delivered: false, provider: getEmailProvider().name, error: error instanceof Error ? error.message : "delivery failed" };
      }
    }
    await completeOutbox(entry.id, result, entry.attempts + 1);
  }
  return entries.length;
}

async function main() {
  const env = getEnv();
  logger.info("worker.started", { service: "worker", workerId: env.WORKER_ID });
  while (!stopping) {
    try {
      const processed = await processOnce();
      if (processed === 0) await sleep(env.WORKER_POLL_INTERVAL_MS);
    } catch (error) {
      logger.error("worker.loop-failed", { service: "worker", error });
      await sleep(env.WORKER_POLL_INTERVAL_MS);
    }
  }
  await closeDb();
  logger.info("worker.stopped", { service: "worker", workerId: env.WORKER_ID });
}

const stop = () => { stopping = true; };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
void main().catch(async (error) => { logger.error("worker.fatal", { service: "worker", error }); await closeDb(); process.exitCode = 1; });
