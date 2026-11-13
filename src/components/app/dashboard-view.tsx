"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  FolderLock,
  BadgeCheck,
  Award,
  Coins,
  ArrowRight,
  Check,
  Clock,
  ChevronRight,
  Send,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { DemoBadge, PageHeader } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/popover";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { RevealOnScroll, RevealGroup } from "@/components/motion/reveal-on-scroll";
import { useT } from "@/components/i18n/language-provider";
import { readStorage, writeStorage, cn } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  DEMO_DOCUMENTS,
  DEMO_ACTIVITY,
  DEMO_ACHIEVEMENTS,
  DEMO_REWARDS,
  REWARDS_BALANCE,
} from "@/lib/demo-data";

const QUICK_ACTIONS = [
  { labelKey: "ai.emptyTitle", href: "/app/ai", icon: Sparkles, hint: "Ask, draft, plan" },
  { labelKey: "documents.newDocument", href: "/app/documents", icon: FileText, hint: "Ten templates" },
  { labelKey: "vault.uploadFiles", href: "/app/vault", icon: FolderLock, hint: "Files & folders" },
  { labelKey: "achievements.submit", href: "/app/achievements", icon: Award, hint: "Four-step wizard" },
  { labelKey: "verification.journey", href: "/app/verification", icon: BadgeCheck, hint: "Track a claim" },
  { labelKey: "opportunities.search", href: "/app/opportunities", icon: Clock, hint: "Sample listings" },
] as const;

const CHECKLIST = [
  { id: "profile", labelKey: "dashboard.checklistProfile", href: "/app/passport" },
  { id: "document", labelKey: "dashboard.checklistDocument", href: "/app/documents" },
  { id: "passport", labelKey: "dashboard.checklistPassport", href: "/app/passport" },
  { id: "verify", labelKey: "dashboard.checklistVerify", href: "/app/achievements" },
] as const;

const GREETING_KEYS = [
  "dashboard.greetingNight",
  "dashboard.greetingMorning",
  "dashboard.greetingMorning",
  "dashboard.greetingAfternoon",
  "dashboard.greetingAfternoon",
  "dashboard.greetingEvening",
  "dashboard.greetingEvening",
  "dashboard.greetingNight",
] as const;

export function DashboardView() {
  const t = useT();

  const [greeting, setGreeting] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState("");
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [helpDismissed, setHelpDismissed] = React.useState(
    () => readStorage(STORAGE_KEYS.dashboardHelp) === "1"
  );
  const [done, setDone] = React.useState<Record<string, boolean>>(() => {
    try {
      const stored = readStorage("vera-dashboard-checklist");
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return {};
  });

  // Greeting uses `new Date()` which must run on the client, not during prerender.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setGreeting(t(GREETING_KEYS[new Date().getHours() % 8]));
    }, 0);
    return () => window.clearTimeout(id);
  }, [t]);

  const toggleTask = (id: string) => {
    setDone((current) => {
      const next = { ...current, [id]: !current[id] };
      writeStorage("vera-dashboard-checklist", JSON.stringify(next));
      return next;
    });
  };

  const dismissHelp = () => {
    setHelpDismissed(true);
    writeStorage(STORAGE_KEYS.dashboardHelp, "1");
  };

  const completed = CHECKLIST.filter((item) => done[item.id]).length;
  const verified = DEMO_ACHIEVEMENTS.filter((a) => a.status === "issuerVerified").length;
  const inProgress = DEMO_ACHIEVEMENTS.length - verified;

  return (
    <div className="flex flex-col gap-8">
      {/* ---------------------------------------------------- Greeting */}
      <PageHeader
        eyebrow={greeting ?? undefined}
        title={greeting ? `${greeting}, Ayaan` : "Ayaan"}
        description={t("dashboard.question")}
        actions={
          <Link href="/app/ai" className={buttonVariants({ variant: "primary", size: "md" })}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("actions.askVera")}
          </Link>
        }
      />

      {/* ------------------------------------------------ AI prompt bar */}
      <RevealOnScroll>
        <section aria-labelledby="dashboard-ai" className="surface-card p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="dashboard-ai" className="flex items-center gap-2 text-h4">
              <Sparkles className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
              {t("nav.ai")}
            </h2>
            <DemoBadge label={t("common.awaitingIntegration")} />
          </div>

          <form
            className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setPreviewOpen(true);
            }}
          >
            <div className="flex-1">
              <label htmlFor="dashboard-prompt" className="sr-only">
                {t("actions.askVera")}
              </label>
              <textarea
                id="dashboard-prompt"
                rows={2}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={t("actions.askVera")}
                className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm shadow-[var(--shadow-xs)] placeholder:text-[var(--subtle-foreground)] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)]"
              />
            </div>
            <Button type="submit" size="lg" disabled={!prompt.trim()}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {t("actions.submit")}
            </Button>
          </form>

          <p className="mt-3 text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
            {t("dashboard.aiPending")}
          </p>

          {previewOpen && (
            <div className="mt-4 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--brand)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                {t("ai.sampleLabel")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {t("ai.sampleNote")} “{prompt.trim()}” would be handled by a connected provider in
                Phase 3. Your prompt has not left this browser.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPreviewOpen(false)}>
                  {t("actions.dismiss")}
                </Button>
                <Link href="/app/ai" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  {t("dashboard.aiPreview")} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </RevealOnScroll>

      {/* ------------------------------------------------ Quick actions */}
      <section aria-labelledby="quick-actions">
        <h2 id="quick-actions" className="text-h4">
          {t("dashboard.quickActions")}
        </h2>
        <RevealGroup className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href + action.labelKey}
              href={action.href}
              className="surface-card group flex items-center gap-3.5 p-4 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] focus-ring"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <action.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{t(action.labelKey)}</span>
                <span className="block truncate text-[0.75rem] text-[var(--subtle-foreground)]">
                  {action.hint}
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-[var(--subtle-foreground)] transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ))}
        </RevealGroup>
      </section>

      {/* ----------------------------------------------- Two-column body */}
      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="flex flex-col gap-6">
          {/* Recent documents */}
          <section aria-labelledby="recent-documents" className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--divider)] px-5 py-4">
              <h2 id="recent-documents" className="text-h4">
                {t("dashboard.recentDocuments")}
              </h2>
              <Link
                href="/app/documents"
                className="text-[0.8125rem] font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
              >
                {t("actions.viewAll")}
              </Link>
            </div>
            <ul className="divide-y divide-[var(--divider)]">
              {DEMO_DOCUMENTS.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <Link
                    href="/app/documents"
                    className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--surface)] focus-ring"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{doc.title}</span>
                      <span className="block truncate text-[0.75rem] text-[var(--subtle-foreground)]">
                        {doc.category} · {doc.words} {t("documents.wordCount")}
                      </span>
                    </span>
                    <span className="shrink-0 text-[0.75rem] text-[var(--subtle-foreground)]">
                      {doc.updatedAt}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Activity */}
          <section aria-labelledby="dashboard-activity" className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--divider)] px-5 py-4">
              <h2 id="dashboard-activity" className="text-h4">
                {t("dashboard.activity")}
              </h2>
              <DemoBadge />
            </div>
            <ol className="divide-y divide-[var(--divider)]">
              {DEMO_ACTIVITY.map((item) => (
                <li key={item.id} className="flex gap-3 px-5 py-3.5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{item.title}</span>
                    <span className="block truncate text-[0.75rem] text-[var(--muted-foreground)]">
                      {item.meta}
                    </span>
                  </span>
                  <span className="shrink-0 text-[0.75rem] text-[var(--subtle-foreground)]">
                    {item.time}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right rail */}
        <div className="flex flex-col gap-6">
          {/* Checklist */}
          {!helpDismissed && (
            <section aria-labelledby="get-started" className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 id="get-started" className="text-h4">
                    {t("dashboard.checklist")}
                  </h2>
                  <p className="mt-1 text-[0.8125rem] text-[var(--muted-foreground)]">
                    {t("dashboard.checklistBody")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismissHelp}
                  className="shrink-0 text-[0.75rem] font-medium text-[var(--subtle-foreground)] hover:text-[var(--foreground)] focus-ring rounded-sm"
                >
                  {t("actions.dismiss")}
                </button>
              </div>

              <Progress
                value={(completed / CHECKLIST.length) * 100}
                label={t("dashboard.checklist")}
                className="mt-4 h-1.5"
              />
              <p className="mt-2 text-[0.75rem] text-[var(--subtle-foreground)]">
                {completed} / {CHECKLIST.length}
              </p>

              <ul className="mt-4 space-y-1">
                {CHECKLIST.map((item) => {
                  const checked = !!done[item.id];
                  return (
                    <li key={item.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-[6px] px-2 py-2 transition-colors hover:bg-[var(--surface)]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTask(item.id)}
                          className="h-4 w-4 shrink-0 rounded-[4px] border border-[var(--border-strong)] accent-[var(--brand)] focus-ring"
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 text-sm",
                            checked ? "text-[var(--subtle-foreground)] line-through" : "text-[var(--foreground)]",
                          )}
                        >
                          {t(item.labelKey)}
                        </span>
                        <Link
                          href={item.href}
                          className="shrink-0 text-[0.75rem] font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
                        >
                          {t("actions.open")}
                        </Link>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Verification */}
          <section aria-labelledby="verification-summary" className="surface-card p-5">
            <div className="flex items-center justify-between">
              <h2 id="verification-summary" className="text-h4">
                {t("dashboard.verification")}
              </h2>
              <Link
                href="/app/verification"
                className="text-[0.8125rem] font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
              >
                {t("actions.viewAll")}
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3.5">
                <p className="text-[0.75rem] text-[var(--muted-foreground)]">
                  {t("status.issuerVerified")}
                </p>
                <p className="mt-1 text-h3 font-semibold tabular-nums text-[var(--success)]">{verified}</p>
              </div>
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3.5">
                <p className="text-[0.75rem] text-[var(--muted-foreground)]">{t("status.unverified")}</p>
                <p className="mt-1 text-h3 font-semibold tabular-nums">{inProgress}</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5">
              {DEMO_ACHIEVEMENTS.slice(0, 3).map((item) => (
                <li key={item.id} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      item.status === "issuerVerified"
                        ? "bg-[var(--success)]"
                        : item.status === "rejected" || item.status === "revoked"
                          ? "bg-[var(--error)]"
                          : "bg-[var(--brand)]",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-[0.8125rem]">{item.title}</span>
                  <span className="shrink-0 text-[0.6875rem] text-[var(--subtle-foreground)]">
                    {t(`status.${item.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Rewards */}
          <section aria-labelledby="rewards-summary" className="surface-card p-5">
            <div className="flex items-center justify-between">
              <h2 id="rewards-summary" className="text-h4">
                {t("dashboard.rewards")}
              </h2>
              <Link
                href="/app/rewards"
                className="text-[0.8125rem] font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
              >
                {t("actions.viewAll")}
              </Link>
            </div>

            <div className="mt-4 flex items-end gap-2">
              <AnimatedCounter
                value={REWARDS_BALANCE}
                className="text-h1 font-semibold text-[var(--brand)]"
                ariaLabel={`${REWARDS_BALANCE} ${t("rewards.points")}`}
              />
              <span className="pb-1.5 text-sm text-[var(--muted-foreground)]">{t("rewards.points")}</span>
            </div>

            <ul className="mt-4 space-y-2">
              {DEMO_REWARDS.slice(0, 3).map((reward) => (
                <li key={reward.id} className="flex items-center gap-2.5 text-[0.8125rem]">
                  <Coins className="h-3.5 w-3.5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">{reward.label}</span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {reward.kind === "redeemed" ? "−" : "+"}
                    {reward.points}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-[var(--divider)] pt-3 text-[0.6875rem] leading-relaxed text-[var(--subtle-foreground)]">
              {t("rewards.demoNote")}
            </p>
          </section>

          <IntegrationPending feature="Live dashboard data">
            {t("common.phase1Note")}
          </IntegrationPending>
        </div>
      </div>

      {completed === CHECKLIST.length && (
        <Alert variant="success" title="Nice — checklist complete.">
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Explore Verification next to see how a
          claim becomes checkable.
        </Alert>
      )}
    </div>
  );
}
