"use client";

import * as React from "react";
import {
  Building2,
  CheckCircle2,
  FileCheck2,
  HelpCircle,
  Send,
  ShieldCheck,
  Upload,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Progress } from "@/components/ui/popover";
import { VerificationBadge, type VerificationStatus } from "@/components/motion/verification-status";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

type Method = "institutional" | "source" | "manual";
type Status = VerificationStatus;

interface Request {
  id: string;
  subject: string;
  method: Method;
  status: Status;
  detail: string;
  updatedAt: string;
}

const REQUESTS: Request[] = [
  {
    id: "vr-1",
    subject: "B.Sc. in Computer Science — North South University",
    method: "institutional",
    status: "awaiting-institution",
    detail: "Verification sent to the registrar on 12 Sep 2026.",
    updatedAt: "12 Sep 2026",
  },
  {
    id: "vr-2",
    subject: "Certified UX Designer — Interaction Design Foundation",
    method: "source",
    status: "source-corroborated",
    detail: "Matched against the issuer's public credential registry.",
    updatedAt: "28 Aug 2026",
  },
  {
    id: "vr-3",
    subject: "Senior Product Designer — Studio North",
    method: "source",
    status: "issuer-verified",
    detail: "Confirmed by the hiring manager via a signed attestation.",
    updatedAt: "04 Aug 2026",
  },
  {
    id: "vr-4",
    subject: "Open-source contribution — aria-live utility",
    method: "manual",
    status: "review-required",
    detail: "Repository activity detected; human review needed before it is shown as verified.",
    updatedAt: "31 Jul 2026",
  },
  {
    id: "vr-5",
    subject: "Speaking engagement — Dhaka Design Week",
    method: "manual",
    status: "rejected",
    detail: "Organiser did not confirm the engagement. Kept as a self-reported claim.",
    updatedAt: "19 Jul 2026",
  },
];

const METHOD_ICON: Record<Method, LucideIcon> = {
  institutional: Building2,
  source: ShieldCheck,
  manual: FileCheck2,
};

export function VerificationView() {
  const t = useT();
  const [method, setMethod] = React.useState<Method>("institutional");
  const [submitted, setSubmitted] = React.useState(false);

  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of REQUESTS) map[r.status] = (map[r.status] ?? 0) + 1;
    return map;
  }, []);

  const done = REQUESTS.filter((r) => r.status === "issuer-verified" || r.status === "source-corroborated").length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("verification.title")}
        description={t("verification.subtitle")}
        actions={<DemoBadge label={t("common.localOnly")} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            { key: "issuer-verified", label: t("status.issuerVerified"), icon: CheckCircle2, tone: "text-[var(--success)]" },
            { key: "source-corroborated", label: t("status.sourceCorroborated"), icon: ShieldCheck, tone: "text-[var(--info)]" },
            { key: "awaiting-institution", label: t("status.awaitingInstitution"), icon: Send, tone: "text-[var(--warning)]" },
            { key: "review-required", label: t("status.reviewRequired"), icon: HelpCircle, tone: "text-[var(--muted-foreground)]" },
          ] as const
        ).map((stat) => (
          <div key={stat.key} className="surface-card flex items-center gap-3 p-4">
            <span aria-hidden="true" className={cn("flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-elevated)]", stat.tone)}>
              <stat.icon className="h-[18px] w-[18px]" />
            </span>
            <span>
              <span className="block text-lg font-semibold tabular-nums">{counts[stat.key] ?? 0}</span>
              <span className="block text-[0.75rem] text-[var(--muted-foreground)]">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="surface-card p-5">
        <h3 className="text-h4">{t("verification.requestTitle")}</h3>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("verification.requestBody")}</p>

        <div role="radiogroup" aria-label={t("verification.method")} className="mt-4 grid gap-3 sm:grid-cols-3">
          {(
            [
              { id: "institutional", label: "Institutional request", desc: "Sent to a university or registry." },
              { id: "source", label: "Source corroboration", desc: "Checked against public records." },
              { id: "manual", label: "Manual review", desc: "A human reviews your evidence." },
            ] as const
          ).map((option) => {
            const active = method === option.id;
            const Icon = METHOD_ICON[option.id];
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMethod(option.id)}
                className={cn(
                  "rounded-[var(--radius-sm)] border p-3.5 text-left transition-colors focus-ring",
                  active
                    ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-strong)]",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
                  {option.label}
                </span>
                <span className="mt-1 block text-[0.75rem] text-[var(--muted-foreground)]">{option.desc}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setSubmitted(true);
              window.setTimeout(() => setSubmitted(false), 2600);
            }}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t("verification.uploadEvidence")}
          </Button>
          <Button variant="secondary" onClick={() => setSubmitted(true)}>
            <Send className="h-4 w-4" aria-hidden="true" />
            {t("verification.sendRequest")}
          </Button>
          <span role="status" aria-live="polite" className="text-[0.8125rem] text-[var(--success)]">
            {submitted ? t("verification.requestSent") : ""}
          </span>
        </div>
      </div>

      <div className="surface-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-h4">{t("verification.statusTitle")}</h3>
          <span className="text-[0.75rem] text-[var(--muted-foreground)]">
            {done} / {REQUESTS.length} {t("verification.confirmed")}
          </span>
        </div>
        <div className="mt-3">
          <Progress value={(done / REQUESTS.length) * 100} label={t("verification.confirmed")} />
        </div>

        <ul className="mt-4 divide-y divide-[var(--divider)]">
          {REQUESTS.map((request) => {
            const Icon = METHOD_ICON[request.method];
            return (
              <li key={request.id} className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span aria-hidden="true" className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] text-[var(--muted-foreground)] sm:flex">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{request.subject}</span>
                  <span className="block text-[0.75rem] text-[var(--subtle-foreground)]">
                    {t(`verification.methods.${request.method}`)} · {request.detail} · {request.updatedAt}
                  </span>
                </span>
                <VerificationBadge status={request.status} />
              </li>
            );
          })}
        </ul>
      </div>

      <Alert variant="warning" className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t("verification.disclaimer")}
      </Alert>

      <IntegrationPending feature="Institutional verification network">
        {t("verification.pendingNote")}
      </IntegrationPending>
    </div>
  );
}
