"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck, Briefcase, Building2, Clock, ExternalLink, MapPin, Search, Sparkles } from "lucide-react";
import { PageHeader, EmptyState, DemoBadge } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/i18n/language-provider";
import { DEMO_OPPORTUNITIES, type OpportunityKind } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const KINDS: OpportunityKind[] = ["jobs", "internships", "freelance", "scholarships", "training", "collaborations"];

export function OpportunitiesView() {
  const t = useT();
  const [kind, setKind] = React.useState<OpportunityKind | "all">("all");
  const [query, setQuery] = React.useState("");
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});

  const items = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_OPPORTUNITIES.filter((item) => {
      const matchesKind = kind === "all" || item.kind === kind;
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.organisation.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      return matchesKind && matchesQuery;
    });
  }, [kind, query]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("opportunities.title")}
        description={t("opportunities.subtitle")}
        actions={
          <>
            <Button variant="secondary">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("opportunities.aiShortlist")}
            </Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      <Alert variant="info">{t("opportunities.sampleNote")}</Alert>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--subtle-foreground)]"
            aria-hidden="true"
          />
          <label htmlFor="opp-search" className="sr-only">
            {t("opportunities.search")}
          </label>
          <Input
            id="opp-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("opportunities.search")}
            className="pl-9"
          />
        </div>

        <div role="tablist" aria-label={t("opportunities.filters")} className="flex flex-wrap gap-1.5">
          {(["all", ...KINDS] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={kind === option}
              onClick={() => setKind(option)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.75rem] font-medium transition-colors focus-ring",
                kind === option
                  ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]",
              )}
            >
              {option === "all" ? t("opportunities.all") : t(`opportunities.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t("opportunities.empty")}
          description={t("opportunities.emptyBody")}
          compact
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li key={item.id} className="surface-card flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <Briefcase className="h-[18px] w-[18px]" />
                </span>
                <button
                  type="button"
                  aria-pressed={!!saved[item.id]}
                  aria-label={t("opportunities.save")}
                  onClick={() => setSaved((s) => ({ ...s, [item.id]: !s[item.id] }))}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors focus-ring",
                    saved[item.id]
                      ? "text-[var(--brand)]"
                      : "text-[var(--subtle-foreground)] hover:text-[var(--foreground)]",
                  )}
                >
                  {saved[item.id] ? (
                    <BookmarkCheck className="h-4 w-4" fill="currentColor" aria-hidden="true" />
                  ) : (
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="flex-1">
                <Badge variant="brand">{t(`opportunities.${item.kind}`)}</Badge>
                <h3 className="mt-2 text-sm font-semibold leading-snug">{item.title}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-[0.8125rem] text-[var(--muted-foreground)]">
                  <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {item.organisation}
                </p>
                <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem] text-[var(--subtle-foreground)]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.deadline}
                  </span>
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--divider)] pt-3">
                <span className="text-[0.6875rem] text-[var(--subtle-foreground)]">
                  {t("opportunities.deadline")}: {item.deadline} · {item.match}%
                </span>
                <Button variant="secondary" size="sm" asChild>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <span className="flex items-center gap-1.5">
                      {t("actions.viewDetails")}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </a>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <IntegrationPending feature="Opportunity feed">
        {t("common.phase1Note")}
      </IntegrationPending>
    </div>
  );
}
