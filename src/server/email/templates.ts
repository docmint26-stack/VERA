/**
 * Transactional email templates — accessible HTML + plain text alternatives.
 * Branding: VERA identity tokens from src/lib/constants.
 */

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "#635BFF";
const INK = "#0b0d12";
const MUTED = "#5b6472";

function shell(title: string, bodyHtml: string, footerNote: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f9;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;border:1px solid #e6e8ef;overflow:hidden;">
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #eef0f6;">
            <span style="font-size:18px;font-weight:700;letter-spacing:-0.02em;color:${INK};">VERA</span>
            <span style="font-size:13px;color:${MUTED};margin-left:8px;">Verifiable Reputation &amp; Achievement</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:20px;line-height:1.35;">${escapeHtml(title)}</h1>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #eef0f6;font-size:12px;line-height:1.6;color:${MUTED};">
            ${footerNote}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0;">
    <a href="${escapeHtml(href)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">
      ${escapeHtml(label)}
    </a>
  </p>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:${MUTED};">${escapeHtml(text)}</p>`;
}

function linkParagraph(prefix: string, href: string, suffix: string): string {
  return `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:${MUTED};">
    ${escapeHtml(prefix)}<a href="${escapeHtml(href)}" style="color:${BRAND};word-break:break-all;">${escapeHtml(href)}</a>${escapeHtml(suffix)}
  </p>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FOOTER = `You received this email because a VERA account action was requested.
If this wasn't you, you can safely ignore this message — no changes were made.`;

// ---------------------------------------------------------------------------

export function renderVerificationEmail(params: {
  name: string;
  url: string;
  expiresInHours: number;
  locale?: string;
}): RenderedEmail {
  const title = "Verify your email address";
  return {
    subject: "Verify your email — VERA",
    html: shell(
      title,
      `${paragraph(`Hi ${params.name},`)}
       ${paragraph(`Confirm your email address to activate your VERA account. This link expires in ${params.expiresInHours} hours.`)}
       ${button(params.url, "Verify email")}
       ${paragraph("If the button doesn't work, paste this link into your browser:")}
       ${linkParagraph("", params.url, "")}`,
      FOOTER,
    ),
    text: [
      title,
      "",
      `Hi ${params.name},`,
      `Confirm your email address to activate your VERA account. This link expires in ${params.expiresInHours} hours.`,
      "",
      params.url,
      "",
      "If you did not create a VERA account, you can ignore this email.",
    ].join("\n"),
  };
}

export function renderPasswordResetEmail(params: { name: string; url: string; expiresInHours: number }): RenderedEmail {
  const title = "Reset your password";
  return {
    subject: "Reset your password — VERA",
    html: shell(
      title,
      `${paragraph(`Hi ${params.name},`)}
       ${paragraph(`We received a request to reset your VERA password. This link expires in ${params.expiresInHours} hours and can only be used once.`)}
       ${button(params.url, "Choose a new password")}
       ${paragraph("If you didn't request this, no action is needed — your password stays unchanged.")}
       ${linkParagraph("", params.url, "")}`,
      FOOTER,
    ),
    text: [
      title,
      "",
      `Hi ${params.name},`,
      `We received a request to reset your VERA password. This link expires in ${params.expiresInHours} hours and can only be used once.`,
      "",
      params.url,
      "",
      "If you didn't request this, no action is needed — your password stays unchanged.",
    ].join("\n"),
  };
}

export function renderEmailChangeEmail(params: { name: string; url: string; newEmail: string }): RenderedEmail {
  const title = "Confirm your new email address";
  return {
    subject: "Confirm your new email — VERA",
    html: shell(
      title,
      `${paragraph(`Hi ${params.name},`)}
       ${paragraph(`Confirm ${params.newEmail} as the new sign-in address for your VERA account.`)}
       ${button(params.url, "Confirm new email")}
       ${paragraph("If you didn't request this change, ignore this email and consider changing your password.")}`,
      FOOTER,
    ),
    text: [
      title,
      "",
      `Hi ${params.name},`,
      `Confirm ${params.newEmail} as the new sign-in address for your VERA account.`,
      "",
      params.url,
      "",
      "If you didn't request this change, ignore this email and consider changing your password.",
    ].join("\n"),
  };
}

export function renderSecurityEmail(params: { name: string; event: string; detail?: string; url?: string }): RenderedEmail {
  const title = "Security notice for your VERA account";
  return {
    subject: `Security notice — ${params.event} — VERA`,
    html: shell(
      title,
      `${paragraph(`Hi ${params.name},`)}
       ${paragraph(params.event)}
       ${params.detail ? paragraph(params.detail) : ""}
       ${params.url ? button(params.url, "Review activity") : ""}`,
      FOOTER,
    ),
    text: [title, "", `Hi ${params.name},`, params.event, params.detail ?? "", params.url ?? ""].filter(Boolean).join("\n"),
  };
}

export function renderInvitationEmail(params: {
  inviterName: string;
  organizationName: string;
  url: string;
  role: string;
}): RenderedEmail {
  const title = `You've been invited to ${params.organizationName}`;
  return {
    subject: `Invitation to ${params.organizationName} — VERA`,
    html: shell(
      title,
      `${paragraph(`${params.inviterName} invited you to join ${params.organizationName} on VERA as ${params.role}.`)}
       ${button(params.url, "Review invitation")}
       ${paragraph("This invitation expires in 7 days.")}`,
      FOOTER,
    ),
    text: [
      title,
      "",
      `${params.inviterName} invited you to join ${params.organizationName} on VERA as ${params.role}.`,
      "",
      params.url,
      "",
      "This invitation expires in 7 days.",
    ].join("\n"),
  };
}
