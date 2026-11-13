import type { Metadata } from "next";
import Link from "next/link";

export function generateStaticParams() {
  return [{ id: "demo-0001" }];
}
import { AlertTriangle, BadgeCheck, ExternalLink, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/marketing/section";
import { VerificationBadge } from "@/components/motion/verification-status";

export const metadata: Metadata = {
  title: "Credential inspection",
  description: "Inspect the details of a shared VERA credential.",
  robots: { index: false, follow: false },
};

const CREDENTIAL = {
  id: "demo-0001",
  subject: "Ayaan Rahman",
  issuer: "Northfield University",
  title: "BSc Human-Computer Interaction",
  issuedOn: "12 Jun 2024",
  expiresOn: "—",
  status: "issuer-verified" as const,
  evidence: "Degree certificate, transcript and registrar confirmation.",
  method: "Institutional request",
  result: "Matched",
};

const TECHNICAL = [
  { label: "Record ID", value: CREDENTIAL.id },
  { label: "Check method", value: CREDENTIAL.method },
  { label: "Source", value: "Registrar confirmation (simulated)" },
  { label: "On-chain proof", value: "Not performed" },
];

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Section className="py-14 sm:py-20">
      <div className="container-page max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="brand">{id}</Badge>
          <VerificationBadge status={CREDENTIAL.status} />
        </div>

        <h1 className="mt-4 text-h1">{CREDENTIAL.title}</h1>
        <p className="mt-2 text-lead text-[var(--muted-foreground)]">
          {CREDENTIAL.subject} · {CREDENTIAL.issuer}
        </p>

        <Alert variant="info" className="mt-6">
          <AlertTriangle className="mr-2 inline h-4 w-4 align-[-2px]" aria-hidden="true" />
          Development example — not a real credential.
        </Alert>

        <dl className="mt-6 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
          {[
            { label: "Subject", value: CREDENTIAL.subject },
            { label: "Issuing organisation", value: CREDENTIAL.issuer },
            { label: "Issued on", value: CREDENTIAL.issuedOn },
            { label: "Expires on", value: CREDENTIAL.expiresOn },
            { label: "Verification method", value: CREDENTIAL.method },
            { label: "Check result", value: CREDENTIAL.result },
          ].map((row) => (
            <div key={row.label} className="bg-[var(--background)] px-5 py-4">
              <dt className="text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--subtle-foreground)]">
                {row.label}
              </dt>
              <dd className="mt-1 text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-h4">
            <BadgeCheck className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            Evidence summary
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {CREDENTIAL.evidence}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-h4">
            <ShieldCheck className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            Technical details
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Advanced details are shown for transparency. You do not need to understand them to use
            VERA.
          </p>
          <dl className="mt-3 divide-y divide-[var(--divider)] rounded-[var(--radius-md)] border border-[var(--border)]">
            {TECHNICAL.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <dt className="text-[0.8125rem] text-[var(--muted-foreground)]">{row.label}</dt>
                <dd className="font-mono text-[0.75rem]">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[0.75rem] leading-relaxed text-[var(--subtle-foreground)]">
            Cryptographic and on-chain checks arrive with Phase 4. No blockchain validation has been
            performed.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/trust" className={buttonVariants({ variant: "primary" })}>
            What verification means
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/app/verification" className={buttonVariants({ variant: "secondary" })}>
            Open the verification workspace
          </Link>
        </div>
      </div>
    </Section>
  );
}
