import { z } from "zod";

/**
 * Central, validated environment configuration.
 *
 * - Server-only: never import from client components.
 * - Validation runs once, lazily, on first server access.
 * - Provider integrations stay optional; a missing credential disables the
 *   feature instead of crashing the app (see `features` below).
 */

const boolish = z
  .union([z.boolean(), z.string()])
  .transform((v) => (typeof v === "boolean" ? v : ["1", "true", "yes"].includes(v.toLowerCase())));

const optionalPair = (a: string, b: string, message: string) =>
  z
    .tuple([z.string().optional(), z.string().optional()])
    .refine(([x, y]) => (!!x && !!y) || (!x && !y), message)
    .transform(([x, y]) => [x || "", y || ""] as const)
    .optional();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _optionalPair = optionalPair;

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    APP_URL: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
    BETTER_AUTH_URL: z.string().url().optional(),

    GOOGLE_CLIENT_ID: z.string().default(""),
    GOOGLE_CLIENT_SECRET: z.string().default(""),

    EMAIL_DELIVERY: z.enum(["dev", "resend", "smtp"]).default("dev"),
    EMAIL_DELIVERY_MODE: z.enum(["inline", "queue"]).default("inline"),
    EMAIL_FROM: z.string().default("VERA <no-reply@vera.example>"),
    RESEND_API_KEY: z.string().default(""),
    SMTP_HOST: z.string().default(""),
    SMTP_PORT: z.coerce.number().default(1025),
    SMTP_USER: z.string().default(""),
    SMTP_PASS: z.string().default(""),
    DEV_OUTBOX_DIR: z.string().default(".local/outbox"),

    STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
    STORAGE_DIR: z.string().default(".local/storage"),
    S3_ENDPOINT: z.string().default(""),
    S3_REGION: z.string().default("auto"),
    S3_BUCKET: z.string().default(""),
    S3_ACCESS_KEY_ID: z.string().default(""),
    S3_SECRET_ACCESS_KEY: z.string().default(""),
    S3_FORCE_PATH_STYLE: boolish.default(true),
    S3_PRESIGN_EXPIRES: z.coerce.number().int().positive().max(3600).default(300),

    MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(100 * 1024 * 1024),
    DEFAULT_STORAGE_QUOTA_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(10 * 1024 * 1024 * 1024),

    CLAMAV_HOST: z.string().default(""),
    CLAMAV_PORT: z.coerce.number().int().default(3310),

    RATE_LIMIT_DRIVER: z.enum(["db", "upstash", "memory"]).default("db"),
    RATE_LIMIT_ENABLED: boolish.default(true),
    UPSTASH_REDIS_REST_URL: z.string().default(""),
    UPSTASH_REDIS_REST_TOKEN: z.string().default(""),

    TURNSTILE_SECRET_KEY: z.string().default(""),
    TURNSTILE_SITE_KEY: z.string().default(""),

    WORKER_POLL_INTERVAL_MS: z.coerce.number().int().min(250).default(2000),
    WORKER_ID: z.string().default("worker-1"),

    TRUST_PROXY: boolish.optional(),
    TRUSTED_PROXY_IPS: z.string().default(""),

    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    EXPOSE_HEALTH_DETAILS: boolish.default(false),
    SKIP_ENV_VALIDATION: boolish.default(false),

    AI_ENABLED: boolish.default(false),
    REWARDS_ENABLED: boolish.default(false),
  })
  .superRefine((env, ctx) => {
    if (env.EMAIL_DELIVERY === "resend" && !env.RESEND_API_KEY) {
      ctx.addIssue({ code: "custom", path: ["RESEND_API_KEY"], message: "RESEND_API_KEY is required when EMAIL_DELIVERY=resend" });
    }
    if (env.EMAIL_DELIVERY === "smtp" && !env.SMTP_HOST) {
      ctx.addIssue({ code: "custom", path: ["SMTP_HOST"], message: "SMTP_HOST is required when EMAIL_DELIVERY=smtp" });
    }
    if (env.STORAGE_PROVIDER === "s3" && (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY)) {
      ctx.addIssue({
        code: "custom",
        path: ["S3_BUCKET"],
        message: "S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required when STORAGE_PROVIDER=s3",
      });
    }
    if (env.RATE_LIMIT_DRIVER === "upstash" && (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN)) {
      ctx.addIssue({
        code: "custom",
        path: ["UPSTASH_REDIS_REST_URL"],
        message: "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required when RATE_LIMIT_DRIVER=upstash",
      });
    }
  });

export type Env = z.infer<typeof schema>;

export interface AppFeatures {
  googleOAuth: boolean;
  turnstile: boolean;
  clamav: boolean;
  objectStorage: "local" | "s3";
  email: "dev" | "resend" | "smtp";
  rateLimitDriver: "db" | "upstash" | "memory";
}

let cached: { env: Env; features: AppFeatures } | null = null;

function load(): { env: Env; features: AppFeatures } {
  if (cached) return cached;
  if (typeof window !== "undefined") {
    throw new Error("Server configuration accessed from the browser");
  }
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${details}\n\nCopy .env.example to .env and fill in the required values.`);
  }
  const env = parsed.data;
  const features: AppFeatures = {
    googleOAuth: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    turnstile: Boolean(env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY),
    clamav: Boolean(env.CLAMAV_HOST),
    objectStorage: env.STORAGE_PROVIDER,
    email: env.EMAIL_DELIVERY,
    rateLimitDriver: env.RATE_LIMIT_DRIVER,
  };
  cached = { env, features };
  return cached;
}

export function getEnv(): Env {
  return load().env;
}

export function getFeatures(): AppFeatures {
  return load().features;
}

/** Trust forwarded client IP headers only when explicitly configured to. */
export function trustProxy(env: Env = getEnv()): boolean {
  if (typeof env.TRUST_PROXY === "boolean") return env.TRUST_PROXY;
  return env.NODE_ENV === "production";
}
