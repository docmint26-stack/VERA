import { getEnv } from "@/lib/config/env";

/**
 * Structured JSON logging with redaction.
 *
 * Never logs: passwords, tokens, secrets, cookies, authorization headers,
 * private document/file contents, or payloads flagged `sensitive`.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const SENSITIVE_KEYS = new Set([
  "password",
  "currentpassword",
  "newpassword",
  "confirmpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "authorization",
  "cookie",
  "set-cookie",
  "apikey",
  "reseedapikey",
  "uploadtoken",
  "value",
  "reseturl",
  "url",
]);

function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth > 6) return "[deep]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        out[key] = "[redacted]";
      } else if (key === "stack" && typeof val === "string") {
        out[key] = val.split("\n").slice(0, 6).join("\n");
      } else {
        out[key] = redact(val, depth + 1);
      }
    }
    return out;
  }
  if (typeof value === "string" && value.length > 2000) return `${value.slice(0, 2000)}…[truncated]`;
  return value;
}

export interface LogFields {
  service?: string;
  operation?: string;
  requestId?: string;
  userId?: string;
  durationMs?: number;
  status?: number;
  error?: unknown;
  [key: string]: unknown;
}

function shouldLog(level: LogLevel): boolean {
  try {
    const configured = getEnv().LOG_LEVEL;
    return LEVEL_ORDER[level] >= LEVEL_ORDER[configured];
  } catch {
    return level !== "debug";
  }
}

function write(level: LogLevel, message: string, fields: LogFields) {
  if (!shouldLog(level)) return;
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...(redact(fields) as LogFields),
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, fields: LogFields = {}) => write("debug", message, fields),
  info: (message: string, fields: LogFields = {}) => write("info", message, fields),
  warn: (message: string, fields: LogFields = {}) => write("warn", message, fields),
  error: (message: string, fields: LogFields = {}) => write("error", message, fields),
};

/** Time an operation and log duration + outcome. */
export async function withTiming<T>(fields: LogFields, fn: () => Promise<T>): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();
    logger.info("operation.ok", { ...fields, durationMs: Date.now() - started });
    return result;
  } catch (error) {
    logger.error("operation.failed", { ...fields, durationMs: Date.now() - started, error });
    throw error;
  }
}
