import type { Metadata } from "next";
import Link from "next/link";
import { Wrench, ArrowRight, Toolbox, Certificate, Users, Clock, Star, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "VERA for Skilled Workers — Prove Your Expertise",
  description: "Document your skills, certifications, and work history to get the recognition you deserve.",
};

const BENEFITS = [
  { icon: Toolbox, title: "Skills Verification", description: "Document and verify your technical skills and certifications for employers." },
  { icon: Certificate, title: "License Tracking", description: "Keep track of all your licenses, certifications, and their expiration dates." },
  { icon: Clock, title: "Work History", description: "Record your work experience with dates, employers, and project details." },
  { icon: FileText, title: "Portfolio", description: "Showcase your best work with photos, descriptions, and client references." },
  { icon: Users, title: "Client References", description: "Collect and verify testimonials from satisfied clients and employers." },
  { icon: Star, title: "Ratings & Reviews", description: "Build a reputation based on verified feedback from people you've worked with." },
];

const USE_CASES = [
  { title: "Job Applications", description: "Apply for jobs with a verified profile that proves your skills and experience." },
  { title: "Contract Bidding", description: "Submit bids with confidence, backed by verified credentials and past work." },
  { title: "Certification Renewal", description: "Track expiration dates and get reminders for license renewals." },
  { title: "Skill Development", description: "Document new skills and certifications as you learn and grow." },
  { title: "Client Proposals", description: "Create professional proposals with your verified work history and credentials." },
  { title: "Networking", description: "Connect with other skilled workers and share verified achievements." },
];

const TRADES = [
  "Electricians", "Plumbers", "Carpenters", "Welders", "Mechanics", "HVAC Technicians",
  "Construction Workers", "Painters", "Masons", "Auto Technicians", "Locksmiths", "Landscapers",
];

export default function SkilledWorkersPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Wrench className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA for Skilled Workers — Prove Your Expertise</h1>
              <p className="text-lead max-w-2xl">
                Your skills are valuable. VERA helps you document, verify, and showcase them to get the jobs and recognition you deserve.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Get Started Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  How it works
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading eyebrow="Benefits" title="Built for skilled workers" description="Tools that understand your needs." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <RevealOnScroll key={benefit.title} delay={100}>
                <article className="surface-card flex flex-col gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <benefit.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-h4">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{benefit.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading eyebrow="Use Cases" title="How skilled workers use VERA" description="Practical tools for your career." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <RevealOnScroll key={useCase.title} delay={200}>
                <article className="surface-card p-6">
                  <h3 className="text-h4 mb-3">{useCase.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{useCase.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <RevealOnScroll>
            <article className="surface-card p-6">
              <h3 className="text-h4 mb-4 text-center">Supported Trades & Professions</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {TRADES.map((trade) => (
                  <span key={trade} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[0.8125rem] font-medium">
                    {trade}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-[0.875rem] text-[var(--muted-foreground)]">
                And many more — VERA works for any skilled profession
              </p>
            </article>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Get recognized for your skills</h2>
              <p className="text-lead max-w-xl">
                Join skilled workers everywhere who use VERA to prove their expertise and grow their careers.
              </p>
              <Link href="/signup" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Create Your Free Account <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
