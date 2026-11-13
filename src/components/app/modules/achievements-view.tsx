"use client";

import * as React from "react";
import { Award, FileCheck2, Send, ShieldCheck } from "lucide-react";
import { PageHeader, EmptyState, DemoBadge } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { VerificationBadge, toVerificationStatus } from "@/components/motion/verification-status";
import { useT } from "@/components/i18n/language-provider";
import { DEMO_ACHIEVEMENTS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Filter = "all" | "verified" | "claim";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "all" },
  { id: "verified", label: "status.issuerVerified" },
  { id: "claim", label: "status.claimOnly" },
];

const STATUS_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "issuer-verified": ShieldCheck,
  "source-corroborated": FileCheck2,
  submitted: Send,
};

export function AchievementsView() {
  const t = useT();
  const [filter, setFilter] = React.useState<Filter>("all");

  const items = DEMO_ACHIEVEMENTS.filter((item) => {
    if (filter === "all") return true;
    const status = toVerificationStatus(item.status);
    return filter === "verified"
      ? status === "issuer-verified" || status === "source-corroborated"
      : status === "submitted" || status === "ai-assessed";
  });

  const verifiedCount = DEMO_ACHIEVEMENTS.filter((item) => {
    const status = toVerificationStatus(item.status);
    return status === "issuer-verified" || status === "source-corroborated";
  }).length;

  const evidenceTotal = DEMO_ACHIEVEMENTS.reduce((sum, item) => sum + item.evidence, 0);
  const percent = Math.round((verifiedCount / DEMO_ACHIEVEMENTS.length) * 100);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("achievements.title")}
        description={t("achievements.subtitle")}
        actions={
          <>
            <Button variant="primary">{t("achievements.submit")}</Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      <div className="surface-card flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
        <p className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
          <span className="tabular-nums">
            {verifiedCount} / {DEMO_ACHIEVEMENTS.length}
          </span>
          <span className="text-[var(--muted-foreground)]">{t("status.issuerVerified")}</span>
        </p>
        <div className="min-w-[180px] flex-1">
          <Progress value={percent} label={t("achievements.title")} />
        </div>
        <p className="text-[0.75rem] text-[var(--muted-foreground)]">
          {t("verification.evidenceSummary")}: <span className="tabular-nums">{evidenceTotal}</span>
        </p>
        <div role="group" aria-label={t("actions.filter")} className="flex gap-1">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                "rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[0.75rem] font-medium transition-colors focus-ring",
                filter === option.id
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {t(option.label)}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Award}
          title={t("achievements.empty")}
          description={t("achievements.emptyBody")}
          compact
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const status = toVerificationStatus(item.status);
            const Icon = STATUS_ICON[status] ?? Award;
            return (
              <li key={item.id} className="surface-card flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge variant="neutral">{item.type}</Badge>
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
                  <p className="mt-1 text-[0.8125rem] text-[var(--muted-foreground)]">
                    {item.issuer} · {item.date}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-[var(--divider)] pt-3">
                  <VerificationBadge status={status} size="sm" />
                  <span className="text-[0.6875rem] tabular-nums text-[var(--subtle-foreground)]">
                    {item.evidence} {t("verification.evidenceSummary")}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Alert variant="info">{t("achievements.submitPending")}</Alert>
      <div className="flex justify-end">
        <Button variant="secondary" size="sm">
          {t("achievements.mySubmissions")}
        </Button>
      </div>
    </div>
  );
}
