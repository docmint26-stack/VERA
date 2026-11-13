"use client";

import * as React from "react";
import {
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  Eye,
  GraduationCap,
  Lock,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { DemoBadge, PageHeader } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { VerificationBadge, toVerificationStatus } from "@/components/motion/verification-status";
import { useT } from "@/components/i18n/language-provider";
import {
  DEMO_EXPERIENCE,
  DEMO_EDUCATION,
  DEMO_PROJECTS,
  DEMO_SKILLS,
  DEMO_CERTIFICATIONS,
  DEMO_RESEARCH,
  type DemoPassportEntry,
} from "@/lib/demo-data";

type Visibility = "everyone" | "invite" | "hidden";

export function PassportView() {
  const t = useT();
  const [visibility, setVisibility] = React.useState<Visibility>("everyone");
  const [copied, setCopied] = React.useState(false);

  const shareUrl = "https://vera.example/u/ayaan-rahman";

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(shareUrl);
    } catch {
      /* clipboard unavailable */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("passport.title")}
        description={t("passport.subtitle")}
        actions={
          <>
            <Button variant="secondary">
              <Pencil className="h-4 w-4" aria-hidden="true" />
              {t("passport.editProfile")}
            </Button>
            <Button variant="primary" onClick={copy}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              {copied ? t("actions.copied") : t("passport.share")}
            </Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      {/* Profile header */}
      <section className="surface-card overflow-hidden" aria-labelledby="passport-identity">
        <div className="border-b border-[var(--divider)] bg-[var(--surface)] px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xl font-semibold text-white"
              >
                AR
              </span>
              <div className="min-w-0">
                <h2 id="passport-identity" className="text-h2">
                  Ayaan Rahman
                </h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Product designer · Dhaka, BD
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <VerificationBadge status={toVerificationStatus("issuerVerified")} />
                  <Badge variant="brand">3 {t("nav.achievements")}</Badge>
                  <Badge variant="brand">8 {t("passport.skills")}</Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div
                role="radiogroup"
                aria-label={t("passport.visibility")}
                className="inline-flex rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-0.5"
              >
                {(
                  [
                    { id: "everyone", label: t("passport.visibleToEveryone"), icon: Eye },
                    { id: "invite", label: t("passport.visibleToInvite"), icon: Share2 },
                    { id: "hidden", label: t("passport.hidden"), icon: Lock },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={visibility === option.id}
                    onClick={() => setVisibility(option.id)}
                    title={option.label}
                    className={
                      "flex h-8 items-center gap-1.5 rounded-[5px] px-2.5 text-[0.75rem] font-medium transition-colors focus-ring " +
                      (visibility === option.id
                        ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")
                    }
                  >
                    <option.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">{option.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <code className="rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 font-mono text-[0.6875rem]">
                  {shareUrl.replace("https://", "")}
                </code>
                <Button variant="ghost" size="icon-sm" aria-label={t("passport.copyLink")} onClick={copy}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("passport.previewProfile")}
                  asChild
                >
                  <a href="/u/ayaan-rahman" target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            <Section title={t("passport.about")} icon={Sparkles}>
              <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                Designer focused on trust signals and verification interfaces. I like work where the
                interface has to be honest about what it does and does not know — which is most
                interfaces, once you look closely.
              </p>
            </Section>

            <Section title={t("passport.skills")} icon={Wrench} actionLabel={t("actions.add")}>
              <ul className="flex flex-wrap gap-2">
                {DEMO_SKILLS.map((skill) => (
                  <li key={skill}>
                    <Badge variant="brand">{skill}</Badge>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title={t("passport.experience")} icon={BadgeCheck} actionLabel={t("actions.add")}>
              <Timeline entries={DEMO_EXPERIENCE} />
            </Section>

            <Section title={t("passport.education")} icon={GraduationCap} actionLabel={t("actions.add")}>
              <Timeline entries={DEMO_EDUCATION} />
            </Section>

            <Section title={t("passport.projects")} icon={Sparkles} actionLabel={t("actions.add")}>
              <Timeline entries={DEMO_PROJECTS} />
            </Section>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="surface-soft p-4">
              <p className="flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--brand)]">
                <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                {t("passport.verificationSummary")}
              </p>
              <dl className="mt-3 space-y-2 text-[0.8125rem]">
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">{t("status.issuerVerified")}</dt>
                  <dd className="font-medium tabular-nums">2</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">{t("status.sourceCorroborated")}</dt>
                  <dd className="font-medium tabular-nums">1</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--muted-foreground)]">{t("status.selfReported")}</dt>
                  <dd className="font-medium tabular-nums">5</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-[var(--divider)] pt-3 text-[0.6875rem] leading-relaxed text-[var(--subtle-foreground)]">
                {t("passport.notVerified")}
              </p>
            </div>

            <div className="surface-soft p-4">
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {t("passport.certifications")}
              </p>
              <ul className="mt-3 space-y-3">
                {DEMO_CERTIFICATIONS.map((cert) => (
                  <li key={cert.id}>
                    <p className="text-[0.8125rem] font-medium">{cert.name}</p>
                    <p className="text-[0.75rem] text-[var(--subtle-foreground)]">
                      {cert.issuer} · {cert.date}
                    </p>
                    <div className="mt-1">
                      <VerificationBadge status={toVerificationStatus(cert.status)} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-soft p-4">
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {t("passport.research")}
              </p>
              <ul className="mt-3 space-y-3">
                {DEMO_RESEARCH.map((item) => (
                  <li key={item.id}>
                    <p className="text-[0.8125rem] font-medium leading-snug">{item.title}</p>
                    <p className="text-[0.75rem] text-[var(--subtle-foreground)]">
                      {item.venue} · {item.date}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <IntegrationPending feature={t("passport.share")}>
              {t("common.phase1Note")}
            </IntegrationPending>
          </aside>
        </div>
      </section>

      <Alert variant="info">
        {t("passport.noEvidence")} — {t("passport.evidence")}
      </Alert>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  actionLabel,
  children,
}: {
  title: string;
  icon: LucideIcon;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-h4">
          <Icon className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
          {title}
        </h3>
        {actionLabel && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-[5px] px-1.5 py-1 text-[0.75rem] font-medium text-[var(--brand)] hover:underline focus-ring"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Timeline({ entries }: { entries: DemoPassportEntry[] }) {
  const t = useT();
  return (
    <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--border)]">
      {entries.map((entry) => (
        <li key={entry.id} className="relative flex gap-4">
          <span
            aria-hidden="true"
            className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--brand)] bg-[var(--background)]"
          />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm font-semibold">{entry.title}</span>
              <span className="text-[0.8125rem] text-[var(--muted-foreground)]">{entry.org}</span>
            </p>
            <p className="text-[0.75rem] text-[var(--subtle-foreground)]">{entry.period}</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{entry.detail}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-[0.6875rem] text-[var(--subtle-foreground)]">
              <Check className="h-3 w-3 text-[var(--success)]" aria-hidden="true" />
              {t("status.selfReported")}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
