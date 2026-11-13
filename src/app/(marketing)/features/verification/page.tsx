import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Check, Search, FileText, Award, UserCheck, XCircle, Clock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { IntegrationPending } from "@/components/ui/alert";
import { VerificationStatusTransition } from "@/components/motion/verification-status";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Verification — Trust Through Transparency",
  description: "Verify your achievements and credentials with a clear, auditable verification process.",
};

const VERIFICATION_STAGES = [
  {
    stage: "Evidence",
    description: "You provide documents and information supporting your claim",
    icon: FileText,
    status: "submitted",
  },
  {
    stage: "Assessment",
    description: "AI analyzes your evidence for completeness and consistency",
    icon: Search,
    status: "assessed",
  },
  {
    stage: "Source Confirmation",
    description: "External sources are contacted to corroborate your claims",
    icon: UserCheck,
    status: "corroborated",
  },
  {
    stage: "Issuer Verification",
    description: "The original issuer cryptographically confirms your credential",
    icon: Award,
    status: "verified",
  },
] as const;

const VERIFICATION_STATUSES = [
  {
    status: "Submitted",
    description: "Your claim has been received and is awaiting review",
    icon: Clock,
    color: "text-[var(--status-submitted)]",
    bg: "bg-[var(--status-submitted-soft)]",
  },
  {
    status: "AI-Assessed",
    description: "AI has analyzed your evidence and identified it as valid",
    icon: Check,
    color: "text-[var(--status-assessed)]",
    bg: "bg-[var(--status-assessed-soft)]",
  },
  {
    status: "Source-Corroborated",
    description: "External sources have confirmed your claims",
    icon: UserCheck,
    color: "text-[var(--status-corroborated)]",
    bg: "bg-[var(--status-corroborated-soft)]",
  },
  {
    status: "Issuer-Verified",
    description: "The issuer has cryptographically verified your credential",
    icon: ShieldCheck,
    color: "text-[var(--status-verified)]",
    bg: "bg-[var(--status-verified-soft)]",
  },
  {
    status: "Rejected",
    description: "Your claim did not pass verification. You can appeal or resubmit.",
    icon: XCircle,
    color: "text-[var(--status-rejected)]",
    bg: "bg-[var(--status-rejected-soft)]",
  },
  {
    status: "Expired",
    description: "This credential has expired and is no longer valid",
    icon: Clock,
    color: "text-[var(--status-expired)]",
    bg: "bg-[var(--status-expired-soft)]",
  },
];

export default function VerificationPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <ShieldCheck className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">Verification — Trust Through Transparency</h1>
              <p className="text-lead max-w-2xl">
                VERA provides a clear, auditable process for verifying achievements and credentials. No mystery, no jargon — just verifiable trust.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/app/verification" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  View Verification <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  How it works
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <IntegrationPending feature="Verification Backend">
            The verification flow is fully implemented in the UI. Actual verification checks against issuers and
            blockchain validation will be available in Phase 2.
          </IntegrationPending>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Verification Journey"
            title="The path from claim to verified credential"
            description="Every credential goes through the same transparent process."
          />
          <div className="mt-10">
            <RevealOnScroll>
              <div className="relative">
                <VerificationStatusTransition status="issuer-verified" />
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {VERIFICATION_STAGES.map((stage, index) => (
                    <article key={stage.stage} className="surface-card flex flex-col gap-3 p-5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                        <stage.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h4 className="font-medium">Stage {index + 1}: {stage.stage}</h4>
                      <p className="text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
                        {stage.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="Status Types"
            title="Understanding verification statuses"
            description="Each status is clearly labeled so you always know exactly what has been verified."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {VERIFICATION_STATUSES.map((status) => (
              <RevealOnScroll key={status.status} delay={100}>
                <article
                  className={cn(
                    "surface-card flex flex-col gap-3 p-5",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]",
                      status.bg,
                      status.color,
                    )}
                  >
                    <status.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h4 className="font-medium">{status.status}</h4>
                  <p className="text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
                    {status.description}
                  </p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Ready to verify your achievements?</h2>
              <p className="text-lead max-w-xl">
                Start the verification process and build a reputation you can take anywhere.
              </p>
              <Link href="/app/verification" className={buttonVariants({ variant: "primary", size: "xl" })}>
                View Verification <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
