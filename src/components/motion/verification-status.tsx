"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileCheck2,
  BrainCircuit,
  Link2,
  BadgeCheck,
  XCircle,
  Ban,
  Clock,
  Send,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";
import type { DemoVerificationStatus } from "@/lib/demo-data";

export type VerificationStatus =
  | "submitted"
  | "awaiting-institution"
  | "review-required"
  | "ai-assessed"
  | "source-corroborated"
  | "issuer-verified"
  | "rejected"
  | "revoked"
  | "expired";

interface StatusMeta {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  fg: string;
  bg: string;
  description: string;
}

export const VERIFICATION_STATUS: Record<VerificationStatus, StatusMeta> = {
  submitted: {
    label: "Submitted",
    shortLabel: "Submitted",
    icon: FileCheck2,
    fg: "var(--status-submitted)",
    bg: "var(--status-submitted-soft)",
    description: "Your claim has been received and is queued for review.",
  },
  "ai-assessed": {
    label: "AI-Assessed",
    shortLabel: "AI assessed",
    icon: BrainCircuit,
    fg: "var(--status-assessed)",
    bg: "var(--status-assessed-soft)",
    description: "Automated review has read your evidence and summarised it.",
  },
  "source-corroborated": {
    label: "Source-Corroborated",
    shortLabel: "Corroborated",
    icon: Link2,
    fg: "var(--status-corroborated)",
    bg: "var(--status-corroborated-soft)",
    description: "Details were matched against an independent public source.",
  },
  "issuer-verified": {
    label: "Issuer-Verified",
    shortLabel: "Verified",
    icon: BadgeCheck,
    fg: "var(--status-verified)",
    bg: "var(--status-verified-soft)",
    description: "The issuing organisation has confirmed this credential.",
  },
  rejected: {
    label: "Rejected",
    shortLabel: "Rejected",
    icon: XCircle,
    fg: "var(--status-rejected)",
    bg: "var(--status-rejected-soft)",
    description: "The evidence was not sufficient to support this claim.",
  },
  revoked: {
    label: "Revoked",
    shortLabel: "Revoked",
    icon: Ban,
    fg: "var(--status-revoked)",
    bg: "var(--status-revoked-soft)",
    description: "The issuer has withdrawn this credential.",
  },
  expired: {
    label: "Expired",
    shortLabel: "Expired",
    icon: Clock,
    fg: "var(--status-expired)",
    bg: "var(--status-expired-soft)",
    description: "This credential is past its validity date.",
  },
  "awaiting-institution": {
    label: "Awaiting Institution",
    shortLabel: "Awaiting",
    icon: Send,
    fg: "var(--warning)",
    bg: "var(--warning-soft)",
    description: "A verification request is waiting for the issuing organisation.",
  },
  "review-required": {
    label: "Review Required",
    shortLabel: "In review",
    icon: HelpCircle,
    fg: "var(--muted-foreground)",
    bg: "var(--surface-elevated)",
    description: "A person needs to review the evidence before a status is assigned.",
  },
};

/** Maps demo data statuses onto the canonical badge statuses. */
const DEMO_STATUS_MAP: Record<DemoVerificationStatus, VerificationStatus> = {
  submitted: "submitted",
  aiAssessed: "ai-assessed",
  sourceCorroborated: "source-corroborated",
  issuerVerified: "issuer-verified",
  rejected: "rejected",
  revoked: "revoked",
  expired: "expired",
};

export function toVerificationStatus(
  status: DemoVerificationStatus | VerificationStatus | string,
): VerificationStatus {
  if (status in DEMO_STATUS_MAP) return DEMO_STATUS_MAP[status as DemoVerificationStatus];
  return status as VerificationStatus;
}

/** Status chip — always pairs colour with an icon and a text label. */
export function VerificationBadge({
  status,
  size = "md",
  className,
  showDescription = false,
}: {
  status: VerificationStatus;
  size?: "sm" | "md";
  className?: string;
  showDescription?: boolean;
}) {
  const meta = VERIFICATION_STATUS[status];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-[0.75rem]",
        className,
      )}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      {meta.label}
      {showDescription && (
        <span className="sr-only"> — {meta.description}</span>
      )}
    </span>
  );
}

/**
 * Morphs from the previous status to the next with an icon cross-fade and
 * a colour transition, so a change in verification state is impossible to miss.
 */
export function VerificationStatusTransition({
  status,
  previousStatus,
  className,
}: {
  status: VerificationStatus;
  previousStatus?: VerificationStatus;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const meta = VERIFICATION_STATUS[status];
  const Icon = meta.icon;
  const changed = previousStatus !== undefined && previousStatus !== status;

  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[0.8125rem] font-medium",
        className,
      )}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          className="flex items-center gap-2"
          initial={reduced ? undefined : { opacity: 0, scale: 0.8, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.85, filter: "blur(4px)" }}
          transition={{ duration: reduced ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {meta.label}
        </motion.span>
      </AnimatePresence>
      {changed && !reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 0 0 ${meta.fg}` }}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0, boxShadow: `0 0 0 8px transparent` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      )}
    </span>
  );
}
