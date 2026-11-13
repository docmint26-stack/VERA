import type { Metadata } from "next";
import Link from "next/link";
import {
  MessageSquareText,
  FolderKanban,
  BadgeCheck,
  Share2,
  ArrowRight,
  Check,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll, RevealGroup } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The VERA workflow end to end: ask and create, organise and claim, verify and share — plus what each verification stage actually does.",
};

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Ask and create",
    body: "Open VERA AI or a document template. Draft from a prompt, attach your own material, and keep iterating until the text says what you mean.",
    detail: "Chat, attachments, ten templates and a rich-text editor.",
  },
  {
    icon: FolderKanban,
    title: "Organise and claim",
    body: "File the source material in My Vault, then describe the achievement: what it was, when it happened, who issued it and what proves it.",
    detail: "Folders, search, four-step achievement wizard, saved drafts.",
  },
  {
    icon: BadgeCheck,
    title: "Verify",
    body: "The claim enters a four-stage journey. Each stage records what was checked and by what method — including the stages that are not connected yet.",
    detail: "Evidence → assessment → source corroboration → issuer sign-off.",
  },
  {
    icon: Share2,
    title: "Share",
    body: "Publish a Passport link or a single credential inspection page. Anyone can read it; you keep control of what is visible.",
    detail: "Visibility controls, public inspection, revocation when the issuer withdraws.",
  },
] as const;

const STAGES = [
  {
    name: "Evidence",
    when: "Immediately after you submit",
    what: "The claim and its attachments are stored together so nothing is asserted without something behind it.",
  },
  {
    name: "Assessment",
    when: "Automated, seconds",
    what: "A machine review summarises what the evidence supports. It is labelled as AI-assessed, never as a decision.",
  },
  {
    name: "Source corroboration",
    when: "When a public source exists",
    what: "Names, dates and identifiers are matched against an independent source. A mismatch does not silently pass.",
  },
  {
    name: "Issuer verification",
    when: "When the issuer participates",
    what: "The issuing organisation confirms or rejects. Only then does a credential become issuer-verified and shareable.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="From a blank page to a claim you can defend"
            description="Four steps, one rule: nothing is presented as verified until something actually verified it."
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page">
          <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <article key={step.title} className="surface-card flex h-full flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-[0.75rem] font-semibold tabular-nums text-[var(--subtle-foreground)]">
                    0{index + 1}
                  </span>
                </div>
                <h2 className="text-h4">{step.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{step.body}</p>
                <p className="mt-auto border-t border-[var(--divider)] pt-3 text-[0.8125rem] text-[var(--subtle-foreground)]">
                  {step.detail}
                </p>
              </article>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section id="verification-stages">
        <div className="container-page">
          <SectionHeading
            eyebrow="Verification"
            title="What each stage actually does"
            description="These are the labels you will see in the product. They are not marketing tiers — they record the method used."
          />

          <div className="mt-12 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Verification stages, when they run and what they check</caption>
              <thead className="bg-[var(--surface)]">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    Stage
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    When it runs
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    What it checks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--divider)] bg-[var(--background)]">
                {STAGES.map((stage) => (
                  <tr key={stage.name}>
                    <th scope="row" className="px-5 py-4 text-sm font-semibold">
                      {stage.name}
                    </th>
                    <td className="px-5 py-4 text-sm text-[var(--muted-foreground)]">{stage.when}</td>
                    <td className="px-5 py-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {stage.what}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Alert variant="warning" title="Not yet performed:">
              {"cryptographic signature checks and on-chain validation are scheduled for Phase 4. No credential in this preview has been validated on a blockchain."}
            </Alert>
            <IntegrationPending feature="Issuer participation">
              Issuer confirmation requires an organisation account and an integration with the issuing body.
            </IntegrationPending>
          </div>
        </div>
      </Section>

      <Section tone="brand">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="text-h1 max-w-2xl text-balance">Try the flow yourself</h2>
          <p className="text-lead max-w-xl">
            Create an account, run onboarding, submit an achievement and watch the journey — all locally,
            with nothing sent to a server.
          </p>
          <RevealOnScroll className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ variant: "primary", size: "xl" })}>
              Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/trust" className={buttonVariants({ variant: "secondary", size: "xl" })}>
              Trust &amp; privacy
            </Link>
          </RevealOnScroll>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {["No server round-trip", "No hidden steps", "Reversible at any time"].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-caption">
                <Check className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
