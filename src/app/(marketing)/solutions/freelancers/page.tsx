import type { Metadata } from "next";
import Link from "next/link";
import { Palette, ArrowRight, FileText, Users, Clock, Award, Briefcase, DollarSign } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "VERA for Freelancers — Manage Your Independent Career",
  description: "Organize projects, verify skills, and showcase your work to attract more clients.",
};

const BENEFITS = [
  { icon: Briefcase, title: "Project Portfolio", description: "Showcase your completed projects with descriptions, deliverables, and client feedback." },
  { icon: FileText, title: "Proposals & Contracts", description: "Create and store professional proposals, contracts, and invoices." },
  { icon: Clock, title: "Time Tracking", description: "Track your time across projects and generate reports for clients." },
  { icon: DollarSign, title: "Invoicing", description: "Create and send professional invoices with your verified credentials." },
  { icon: Award, title: "Skill Verification", description: "Verify your skills and certifications to build trust with potential clients." },
  { icon: Users, title: "Client Management", description: "Organize client information, project history, and communication." },
];

const USE_CASES = [
  { title: "Client Proposals", description: "Create compelling proposals with verified credentials and past work examples." },
  { title: "Portfolio Website", description: "Use your VERA passport as a professional portfolio to attract new clients." },
  { title: "Testimonials", description: "Collect and verify client testimonials to build your reputation." },
  { title: "Project Documentation", description: "Organize all project files, contracts, and deliverables in one place." },
  { title: "Skill Development", description: "Document new skills and certifications to expand your service offerings." },
  { title: "Networking", description: "Connect with other freelancers and potential collaborators." },
];

const FREELANCE_CATEGORIES = [
  "Graphic Design", "Web Development", "Writing & Editing", "Marketing", "Consulting",
  "Video & Animation", "Photography", "Translation", "Virtual Assistance", "Accounting",
];

export default function FreelancersPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Palette className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA for Freelancers — Manage Your Independent Career</h1>
              <p className="text-lead max-w-2xl">
                As a freelancer, your reputation is your most valuable asset. VERA helps you build, verify, and showcase it to attract more clients and better projects.
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
          <SectionHeading eyebrow="Benefits" title="Freelancer-focused features" description="Tools designed for independent professionals." />
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
          <SectionHeading eyebrow="Use Cases" title="How freelancers use VERA" description="Practical applications for independent work." />
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
              <h3 className="text-h4 mb-4 text-center">Freelance Categories</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {FREELANCE_CATEGORIES.map((category) => (
                  <span key={category} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[0.8125rem] font-medium">
                    {category}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-[0.875rem] text-[var(--muted-foreground)]">
                And many more — VERA supports freelancers in any field
              </p>
            </article>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Build your freelance reputation</h2>
              <p className="text-lead max-w-xl">
                Join freelancers worldwide who use VERA to verify their skills and attract more clients.
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
