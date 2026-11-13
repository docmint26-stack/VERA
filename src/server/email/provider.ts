import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getEnv, getFeatures } from "@/lib/config/env";
import { logger } from "@/server/observability/logger";

/**
 * Email provider abstraction.
 *
 *   dev    — writes the rendered message to the local outbox directory.
 *            NOTHING is delivered to a real inbox; callers must not claim
 *            successful delivery in this mode.
 *   resend — Resend HTTP API (free tier; requires a verified domain).
 *   smtp   — any SMTP server (Mailpit for local capture, or a real provider).
 *
 * Only one provider is active at a time (EMAIL_DELIVERY).
 */

export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  tag?: string;
}

export interface EmailSendResult {
  delivered: boolean;
  provider: "dev" | "resend" | "smtp";
  messageId?: string;
  error?: string;
  /** True when the message was captured locally instead of being sent. */
  localCapture?: boolean;
}

export interface EmailProvider {
  readonly name: "dev" | "resend" | "smtp";
  send(message: EmailMessage): Promise<EmailSendResult>;
}

// ---------------------------------------------------------------------------

class DevEmailProvider implements EmailProvider {
  readonly name = "dev" as const;

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const env = getEnv();
    const dir = path.resolve(process.cwd(), env.DEV_OUTBOX_DIR);
    await mkdir(dir, { recursive: true });
    const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}-${message.tag ?? "message"}.json`;
    await writeFile(
      path.join(dir, filename),
      JSON.stringify({ ...message, capturedAt: new Date().toISOString() }, null, 2),
      "utf8",
    );
    logger.info("email.dev-outbox", {
      service: "email",
      provider: "dev",
      to: message.to.map((a) => a.replace(/^(.).*(@.*)$/, "$1***$2")),
      tag: message.tag,
      file: filename,
      delivered: false,
    });
    return { delivered: false, provider: "dev", localCapture: true, messageId: filename };
  }
}

class ResendEmailProvider implements EmailProvider {
  readonly name = "resend" as const;

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const env = getEnv();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: message.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return {
        delivered: false,
        provider: "resend",
        error: `resend ${response.status}: ${detail.slice(0, 300)}`,
      };
    }
    const data = (await response.json().catch(() => ({}))) as { id?: string };
    return { delivered: true, provider: "resend", messageId: data.id };
  }
}

class SmtpEmailProvider implements EmailProvider {
  readonly name = "smtp" as const;

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const env = getEnv();
    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
    });
    try {
      const info = await transport.sendMail({
        from: message.from,
        to: message.to.join(", "),
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      return { delivered: true, provider: "smtp", messageId: info.messageId };
    } finally {
      transport.close?.();
    }
  }
}

let cached: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cached) return cached;
  const features = getFeatures();
  cached =
    features.email === "resend"
      ? new ResendEmailProvider()
      : features.email === "smtp"
        ? new SmtpEmailProvider()
        : new DevEmailProvider();
  return cached;
}

export function resetEmailProvider(): void {
  cached = null;
}
