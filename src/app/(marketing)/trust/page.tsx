import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Eye,
  Lock,
  ServerOff,
  Database,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealGroup } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "Trust & Verification",
  description:
    "How VERA handles evidence, what is stored where, which checks are not yet connected, and how verification labels map to real methods.",
};

const PRINCIPLES = [
  {
    icon: Eye,
    title: "No implied verification",
    body: "A self-entered claim is labelled “Your claim” or “Self-reported” until a stage actually checks it.",
  },
  {
    icon: ServerOff,
    title: "No silent integrations",
    body: "Every capability that needs a backend shows an “awaiting integration” notice instead of faking success.",
  },
  {
    icon: Database,
    title: "Local by default",
    body: "In this preview, documents, files, drafts and profile data stay in your browser's storage.",
  },
  {
    icon: Lock,
    title: "Minimal collection",
    body: "The interface never asks for information it does not use, and analytics are opt-in rather than assumed.",
  },
] as const;

const LABELS = [
  { label: "Your claim", meaning: "You stated it. Nothing has checked it." },
  { label: "Self-reported", meaning: "You stated it and attached your own material." },
  { label: "AI-Assessed", meaning: "An automated review summarised the evidence." },
  { label: "Source-Corroborated", meaning: "Details matched an independent source." },
  { label: "Issuer-Verified", meaning: "The issuing organisation confirmed it." },
  { label: "Rejected", meaning: "The evidence did not support the claim." },
  { label: "Revoked", meaning: "The issuer withdrew a previously issued credential." },
  { label: "Expired", meaning: "The credential passed its validity date." },
] as const;

export default function TrustPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Trust & verification"
            title="Trust is a process, not a badge"
            description="VERA shows the work behind every status. If a check has not happened, the product says so — including on this page."
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page">
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((principle) => (
              <article key={principle.title} className="surface-card flex flex-col gap-3 p-6">
                <principle.icon className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
                <h2 className="text-h4">{principle.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{principle.body}</p>
              </article>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section id="labels">
        <div className="container-page">
          <SectionHeading
            eyebrow="Labels"
            title="What each status is allowed to claim"
            description="These labels are used consistently across the Passport, achievements and public inspection pages."
          />
          <div className="mt-12 grid gap-3 sm:grid-cols-2">
            {LABELS.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-44 shrink-0 text-sm font-semibold">{item.label}</span>
                <span className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {item.meaning}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <p className="text-overline">What is stored where</p>
            <h2 className="text-h2">Your data in Phase 1</h2>
            <ul className="space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
              <li className="flex gap-2.5">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                Documents, drafts and vault files: this browser only.
              </li>
              <li className="flex gap-2.5">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                Passport profile, bookmarks and onboarding choices: this browser only.
              </li>
              <li className="flex gap-2.5">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                Theme, language and motion preferences: this browser only.
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" aria-hidden="true" />
                Authentication credentials: not stored anywhere yet — there is no backend.
              </li>
            </ul>
            <Alert variant="warning" title="Clearing site data erases everything.">
              There is no account to restore from until Phase 2 ships storage.
            </Alert>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-overline">Not yet connected</p>
            <h2 className="text-h2">Checks we have not run</h2>
            <div className="space-y-3">
              <IntegrationPending feature="Cryptographic signature verification">
                Credential signatures are not generated or validated in Phase 1.
              </IntegrationPending>
              <IntegrationPending feature="On-chain validation">
                No blockchain, wallet or smart contract interaction exists in this build.
              </IntegrationPending>
              <IntegrationPending feature="Issuer directory">
                There is no directory of participating issuers to check against.
              </IntegrationPending>
              <IntegrationPending feature="Background screening">
                VERA does not run background checks and will never imply that it does.
              </IntegrationPending>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="brand">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="text-h1 max-w-2xl text-balance">Read the credential inspection page</h2>
          <p className="text-lead max-w-xl">
            The public view is the honest one: it shows the subject, the issuer, the evidence summary and
            the exact method used — or not used.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/verify/demo-credential" className={buttonVariants({ variant: "primary", size: "xl" })}>
              View a demo credential <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "xl" })}>
              The four stages
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
