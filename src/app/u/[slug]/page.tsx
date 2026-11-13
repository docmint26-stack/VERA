import type { Metadata } from "next";
import Link from "next/link";

export function generateStaticParams() {
  return [{ slug: "ayaan-rahman" }];
}
import { BadgeCheck, Eye, Lock, Share2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/marketing/section";
import { VerificationBadge } from "@/components/motion/verification-status";
import {
  DEMO_CERTIFICATIONS,
  DEMO_EDUCATION,
  DEMO_EXPERIENCE,
  DEMO_PROJECTS,
  DEMO_RESEARCH,
  DEMO_SKILLS,
  type DemoPassportEntry,
} from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Ayaan Rahman — VERA Passport",
  description: "A shareable professional profile with explicit verification status on every claim.",
  robots: { index: false, follow: false },
};

const PROFILE = {
  name: "Ayaan Rahman",
  initials: "AR",
  headline: "Product designer",
  location: "Dhaka, BD",
  url: "/u/ayaan-rahman",
};

function Timeline({ entries }: { entries: DemoPassportEntry[] }) {
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
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {entry.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default async function PublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <Section className="py-14 sm:py-20">
      <div className="container-page max-w-3xl">
        <p className="flex items-center gap-2 text-overline uppercase tracking-wider text-[var(--subtle-foreground)]">
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          Public VERA Passport · {slug}
        </p>

        <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xl font-semibold text-white"
            >
              {PROFILE.initials}
            </span>
            <div>
              <h1 className="text-h1">{PROFILE.name}</h1>
              <p className="mt-1 text-lead text-[var(--muted-foreground)]">
                {PROFILE.headline} · {PROFILE.location}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <VerificationBadge status="issuer-verified" />
                <Badge variant="neutral">3 achievements</Badge>
                <Badge variant="neutral">8 skills</Badge>
              </div>
            </div>
          </div>

          <Link href="/signup" className={buttonVariants({ variant: "primary", size: "sm" })}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Build your own
          </Link>
        </div>

        <Alert variant="info" className="mt-6">
          <Lock className="mr-2 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
          Development example. This profile was shared by its owner and shows only what they chose to
          publish.
        </Alert>

        <section className="mt-8">
          <h2 className="text-h3">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Designer focused on trust signals and verification interfaces. I like work where the
            interface has to be honest about what it does and does not know.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-h3">Skills</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {DEMO_SKILLS.map((skill) => (
              <li key={skill}>
                <Badge variant="neutral">{skill}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-h3">Work experience</h2>
          <div className="mt-4">
            <Timeline entries={DEMO_EXPERIENCE} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-h3">Education</h2>
          <div className="mt-4">
            <Timeline entries={DEMO_EDUCATION} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-h3">Projects</h2>
          <div className="mt-4">
            <Timeline entries={DEMO_PROJECTS} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-h3">
            <BadgeCheck className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            Certifications
          </h2>
          <ul className="mt-3 divide-y divide-[var(--divider)] rounded-[var(--radius-md)] border border-[var(--border)]">
            {DEMO_CERTIFICATIONS.map((cert) => (
              <li key={cert.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block text-sm font-medium">{cert.name}</span>
                  <span className="block text-[0.75rem] text-[var(--subtle-foreground)]">
                    {cert.issuer} · {cert.date}
                  </span>
                </span>
                <VerificationBadge
                  status={
                    cert.status === "issuerVerified"
                      ? "issuer-verified"
                      : cert.status === "aiAssessed"
                        ? "ai-assessed"
                        : "submitted"
                  }
                  size="sm"
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-h3">Research</h2>
          <ul className="mt-3 space-y-3">
            {DEMO_RESEARCH.map((item) => (
              <li key={item.id}>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-[0.8125rem] text-[var(--muted-foreground)]">
                  {item.venue} · {item.date}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 border-t border-[var(--divider)] pt-6 text-[0.75rem] leading-relaxed text-[var(--subtle-foreground)]">
          A verification badge describes what was checked. It is not a guarantee of anything beyond
          that. Claims without evidence are shown as self-reported.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/verify/demo-0001" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Inspect a credential
          </Link>
          <Link href="/trust" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            How verification works
          </Link>
        </div>
      </div>
    </Section>
  );
}
