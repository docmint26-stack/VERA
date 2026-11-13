import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Scale, Cpu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading, StatRow } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why VERA exists, what it refuses to do, and how the project is staged from interface preview to verified credentials.",
};

const VALUES = [
  {
    icon: Scale,
    title: "Show the method",
    body: "A status is only useful if it says how it was reached. VERA labels the mechanism, not just the outcome.",
  },
  {
    icon: Heart,
    title: "Respect the reader",
    body: "No dark patterns, no forced account before you can look around, no artificial urgency.",
  },
  {
    icon: Cpu,
    title: "Say what is not ready",
    body: "Phase 1 is an interface preview. Every unbuilt capability is marked as such rather than simulated.",
  },
] as const;

const ROADMAP = [
  { phase: "Phase 1", title: "Interface preview", state: "Current", body: "Full product surface running locally in your browser." },
  { phase: "Phase 2", title: "Accounts & storage", state: "Next", body: "Real authentication, cloud storage, sharing and data export." },
  { phase: "Phase 3", title: "AI & export", state: "Planned", body: "Connected AI provider, PDF/DOCX export, notifications." },
  { phase: "Phase 4", title: "Verification at depth", state: "Planned", body: "Issuer integrations, cryptographic checks, optional on-chain anchoring." },
] as const;

export default function AboutPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page max-w-3xl">
          <p className="text-overline">About</p>
          <h1 className="mt-4 text-display text-balance">
            Proof should outlive the room it was made in.
          </h1>
          <p className="mt-6 text-lead">
            Most of what people achieve is asserted in a place that disappears: a resume bullet, a
            conversation, a screenshot in a folder. VERA exists to give that work a durable, checkable
            home — and to be honest about the difference between a claim and a verification.
          </p>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <div className="grid gap-5 md:grid-cols-3">
            {VALUES.map((value) => (
              <article key={value.title} className="surface-card flex flex-col gap-3 p-6">
                <value.icon className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
                <h2 className="text-h4">{value.title}</h2>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{value.body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="roadmap">
        <div className="container-page">
          <SectionHeading
            eyebrow="Roadmap"
            title="Where this preview sits"
            description="Four phases, each one shipping only what it can honestly support."
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((item, index) => (
              <li
                key={item.phase}
                className={
                  item.state === "Current"
                    ? "rounded-[var(--radius-md)] border border-[var(--brand)] bg-[var(--brand-soft)] p-5"
                    : "surface-card p-5"
                }
              >
                <div className="flex items-center justify-between">
                  <span className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--brand)]">
                    {item.phase}
                  </span>
                  <span
                    className={
                      item.state === "Current"
                        ? "rounded-full bg-[var(--brand)] px-2 py-0.5 text-[0.625rem] font-semibold text-white"
                        : "text-[0.625rem] font-medium text-[var(--subtle-foreground)]"
                    }
                  >
                    {item.state}
                  </span>
                </div>
                <h3 className="mt-3 text-h4">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.body}</p>
                <span className="sr-only">Step {index + 1} of 4</span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <StatRow
            items={[
              { value: "Phase 1", label: "Current stage" },
              { value: "11", label: "Modules shipped" },
              { value: "2", label: "Languages" },
              { value: "100%", label: "Client-side" },
            ]}
          />
        </div>
      </Section>

      <Section tone="brand">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="text-h1 max-w-2xl text-balance">See what is actually built</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/features" className={buttonVariants({ variant: "primary", size: "xl" })}>
              Explore features <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/trust" className={buttonVariants({ variant: "secondary", size: "xl" })}>
              Trust &amp; verification
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
