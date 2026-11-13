import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { captcha } from "better-auth/plugins";
import { getEnv, getFeatures } from "@/lib/config/env";
import { getDb } from "@/server/db/client";
import { sendEmail } from "@/server/email/send";
import {
  renderEmailChangeEmail,
  renderPasswordResetEmail,
  renderSecurityEmail,
  renderVerificationEmail,
} from "@/server/email/templates";
import { betterAuthRateLimitStorage } from "@/server/security/rate-limit";

/**
 * Better Auth configuration.
 *
 * Security posture:
 * - Password hashing is delegated to Better Auth (scrypt).
 * - Email verification is required before sign-in completes.
 * - Reset/change links are single-use and expiring (library-enforced).
 * - Rate limiting uses the distributed Postgres/Upstash driver, never
 *   process-local counters alone.
 * - Google OAuth is registered only when valid credentials exist.
 * - Turnstile is enforced on risk-sensitive public endpoints when configured.
 */

const env = getEnv();
const features = getFeatures();

export const auth = betterAuth({
  appName: "VERA",
  baseURL: env.BETTER_AUTH_URL || env.APP_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(getDb(), { provider: "postgresql" }),

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh expiry daily
    freshAge: 60 * 5, // sessions younger than 5m are "fresh" for sensitive ops
    cookieCache: {
      enabled: false, // always consult the database so revocation is immediate
    },
  },

  user: {
    additionalFields: {
      // input:false → clients can never write these (no mass assignment).
      role: { type: "string", required: false, defaultValue: "USER", returned: true, input: false },
      status: { type: "string", required: false, defaultValue: "ACTIVE", returned: true, input: false },
      slug: { type: "string", required: false, returned: true, input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 3600,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        ...renderPasswordResetEmail({ name: user.name, url, expiresInHours: 1 }),
        from: env.EMAIL_FROM,
        to: [user.email],
        tag: "password-reset",
        aggregateType: "user",
        aggregateId: user.id,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    expiresIn: 24 * 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        ...renderVerificationEmail({ name: user.name, url, expiresInHours: 24 }),
        from: env.EMAIL_FROM,
        to: [user.email],
        tag: "email-verification",
        aggregateType: "user",
        aggregateId: user.id,
      });
    },
  },

  ...(features.googleOAuth
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            scope: ["openid", "email", "profile"],
          },
        },
      }
    : {}),

  rateLimit: {
    enabled: true,
    window: 60,
    max: 120,
    customStorage: betterAuthRateLimitStorage,
    customRules: {
      "/sign-up/email": { window: 60, max: 5 },
      "/sign-in/email": { window: 60, max: 10 },
      "/request-password-reset": { window: 300, max: 5 },
      "/reset-password": { window: 300, max: 10 },
      "/send-verification-email": { window: 300, max: 5 },
      "/verify-email": { window: 60, max: 30 },
      "/change-email": { window: 300, max: 5 },
      "/sign-in/social": { window: 60, max: 10 },
    },
  },

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
    cookiePrefix: "vera",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for"],
      ...(env.TRUSTED_PROXY_IPS
        ? { trustedProxies: env.TRUSTED_PROXY_IPS.split(",").map((s) => s.trim()).filter(Boolean) }
        : {}),
    },
    crossSubDomainCookies: {
      enabled: false,
    },
  },

  // Captcha (when configured) must run before nextCookies, which must be last
  // so Next.js cookies are set correctly.
  plugins: [
    ...(features.turnstile
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: env.TURNSTILE_SECRET_KEY,
            endpoints: ["/sign-up/email", "/sign-in/email", "/request-password-reset"],
          }),
        ]
      : []),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;

/** Send a security-related account email (never logs tokens). */
export async function sendSecurityEmail(input: {
  userId: string;
  email: string;
  name: string;
  event: string;
  detail?: string;
  url?: string;
}): Promise<void> {
  await sendEmail({
    ...renderSecurityEmail({ name: input.name, event: input.event, detail: input.detail, url: input.url }),
    from: env.EMAIL_FROM,
    to: [input.email],
    tag: "security",
    aggregateType: "user",
    aggregateId: input.userId,
  });
}

export async function sendEmailChangeEmail(input: {
  userId: string;
  email: string;
  name: string;
  newEmail: string;
  url: string;
}): Promise<void> {
  await sendEmail({
    ...renderEmailChangeEmail({ name: input.name, url: input.url, newEmail: input.newEmail }),
    from: env.EMAIL_FROM,
    to: [input.email],
    tag: "email-change",
    aggregateType: "user",
    aggregateId: input.userId,
  });
}
