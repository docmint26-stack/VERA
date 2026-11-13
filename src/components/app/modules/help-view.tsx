"use client";

import * as React from "react";
import {
  BookOpen,
  ChevronDown,
  LifeBuoy,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { PageHeader, EmptyState, DemoBadge } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

interface Faq {
  q: string;
  a: string;
}

const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: "Getting started",
    items: [
      {
        q: "What is VERA?",
        a: "VERA is a place to build a professional profile from the evidence you already have — documents, credentials and experience — and share it as a single link.",
      },
      {
        q: "What can I do today?",
        a: "Everything in Phase 1 runs locally in your browser: onboarding, the dashboard, document editing, your passport, achievements, verification requests and rewards.",
      },
      {
        q: "Do I need an account?",
        a: "A demo account works for now. Sign in with demo@vera.app and Password123 to explore the workspace.",
      },
    ],
  },
  {
    title: "Verification",
    items: [
      {
        q: "Does a badge mean something is verified?",
        a: "Only if it says so. Verification status is shown explicitly on every claim: issuer verified, source corroborated, self reported, awaiting institution, review required or rejected.",
      },
      {
        q: "Who can see my passport?",
        a: "You control visibility per profile: everyone, invite only, or hidden. Nothing is published without you choosing to share it.",
      },
      {
        q: "What happens when a request is rejected?",
        a: "The claim stays on your profile as self reported. Nothing is deleted, and nothing is upgraded without evidence.",
      },
    ],
  },
  {
    title: "Privacy and data",
    items: [
      {
        q: "Where is my data stored?",
        a: "Phase 1 keeps data in your browser only. Nothing is uploaded to a server, and clearing site data clears your workspace.",
      },
      {
        q: "Can I export my data?",
        a: "Export arrives with storage integration. For now the dashboard and passport are read-only views of demo data.",
      },
    ],
  },
];

const SHORTCUTS: { keys: string[]; action: string }[] = [
  { keys: ["Ctrl", "K"], action: "Open the command palette" },
  { keys: ["Ctrl", "K"], action: "Search documents and pages" },
  { keys: ["Esc"], action: "Close any dialog or palette" },
  { keys: ["Enter"], action: "Send an AI message" },
];

export function HelpView() {
  const t = useT();
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<string | null>("Getting started-0");

  const groups = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ_GROUPS;
    return FAQ_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      ),
    })).filter((group) => group.items.length > 0);
  }, [query]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("help.title")}
        description={t("help.subtitle")}
        actions={<DemoBadge label={t("common.localOnly")} />}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            { icon: BookOpen, title: t("help.docs"), body: t("help.docsBody") },
            { icon: MessageSquare, title: t("help.contact"), body: t("help.contactBody") },
            { icon: LifeBuoy, title: t("help.status"), body: t("help.statusBody") },
          ] as const
        ).map((card) => (
          <div key={card.title} className="surface-card flex flex-col gap-2 p-5">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
              <card.icon className="h-4 w-4" />
            </span>
            <p className="text-sm font-semibold">{card.title}</p>
            <p className="text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="surface-card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-h4">{t("help.faq")}</h2>
          <div className="relative min-w-[220px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--subtle-foreground)]"
              aria-hidden="true"
            />
            <label htmlFor="help-search" className="sr-only">
              {t("help.searchFaq")}
            </label>
            <Input
              id="help-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("help.searchFaq")}
              className="pl-9"
            />
          </div>
        </div>

        {total === 0 ? (
          <div className="mt-4">
            <EmptyState icon={Search} title={t("help.emptySearch")} description={t("help.emptySearchBody")} compact />
          </div>
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_260px]">
            <div className="flex flex-col gap-6">
              {groups.map((group) => (
                <section key={group.title}>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--subtle-foreground)]">
                    {group.title}
                  </p>
                  <ul className="mt-2 divide-y divide-[var(--divider)]">
                    {group.items.map((item, index) => {
                      const id = `${group.title}-${index}`;
                      const expanded = open === id;
                      return (
                        <li key={id}>
                          <h3>
                            <button
                              type="button"
                              aria-expanded={expanded}
                              aria-controls={`faq-panel-${id}`}
                              onClick={() => setOpen(expanded ? null : id)}
                              className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium focus-ring"
                            >
                              {item.q}
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
                                  expanded && "rotate-180",
                                )}
                                aria-hidden="true"
                              />
                            </button>
                          </h3>
                          <div
                            id={`faq-panel-${id}`}
                            hidden={!expanded}
                            className="pb-3 text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]"
                          >
                            {item.a}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>

            <aside className="flex flex-col gap-4">
              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" aria-hidden="true" />
                  {t("help.shortcuts")}
                </p>
                <ul className="mt-3 space-y-2.5">
                  {SHORTCUTS.map((shortcut, index) => (
                    <li key={index} className="flex items-center justify-between gap-3 text-[0.8125rem]">
                      <span className="text-[var(--muted-foreground)]">{shortcut.action}</span>
                      <span className="flex shrink-0 gap-1">
                        {shortcut.keys.map((key) => (
                          <Kbd key={key}>{key}</Kbd>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {t("help.support")}
                </p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
                  {t("help.supportBody")}
                </p>
                <Button variant="secondary" size="sm" className="mt-3" asChild>
                  <a href="/contact">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {t("nav.contact")}
                  </a>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Alert variant="info">{t("common.phase1Note")}</Alert>
      <IntegrationPending feature={t("help.support")}>
        {t("help.supportBody")}
      </IntegrationPending>
      <div className="flex justify-end">
        <Badge variant="brand">{t("help.shortcuts")}</Badge>
      </div>
    </div>
  );
}
