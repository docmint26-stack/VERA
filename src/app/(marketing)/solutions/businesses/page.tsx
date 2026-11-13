import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ArrowRight, Users, Award, FileText, ShieldCheck, Network, TrendingUp } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "VERA for Businesses — Hire with Confidence",
  description: "Verify candidate credentials, issue digital badges, and build a trusted workforce.",
};

const BENEFITS = [
  { icon: ShieldCheck, title: "Verified Hiring", description: "Verify candidate degrees, certifications, and work history with cryptographic proof." },
  { icon: Award, title: "Digital Badges", description: "Issue verifiable credentials and badges to employees and contractors." },
  { icon: Users, title: "Talent Management", description: "Organize employee profiles, skills, and credentials in one place." },
  { icon: FileText, title: "Document Verification", description: "Verify educational certificates, licenses, and professional qualifications." },
  { icon: Network, title: "Trusted Network", description: "Build a network of verified professionals and organizations." },
  { icon: TrendingUp, title: "Compliance", description: "Ensure all credentials are up-to-date and comply with industry standards." },
];

const USE_CASES = [
  { title: "Recruitment", description: "Verify candidate credentials before making hiring decisions." },
  { title: "Employee Onboarding", description: "Quickly verify new hire qualifications and credentials." },
  { title: "Internal Mobility", description: "Verify employee skills and experience for internal transfers and promotions." },
  { title: "Contractor Management", description: "Verify contractor credentials and track their certifications." },
  { title: "Training & Development", description: "Issue verifiable certificates for completed training programs." },
  { title: "Compliance Audits", description: "Maintain verifiable records for regulatory compliance and audits." },
];

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing", "Construction",
  "Professional Services", "Retail", "Non-Profit", "Government",
];

export default function BusinessesPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Building2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA for Businesses — Hire with Confidence</h1>
              <p className="text-lead max-w-2xl">
                Reduce hiring risk and build a trusted workforce by verifying credentials with VERA. Make better hiring decisions with verifiable proof.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/contact" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Get in Touch <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
          <SectionHeading eyebrow="Benefits" title="Business advantages" description="Tools for smarter hiring and talent management." />
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
          <SectionHeading eyebrow="Use Cases" title="How businesses use VERA" description="Practical applications for talent management." />
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
              <h3 className="text-h4 mb-4 text-center">Industries We Serve</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {INDUSTRIES.map((industry) => (
                  <span key={industry} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[0.8125rem] font-medium">
                    {industry}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-[0.875rem] text-[var(--muted-foreground)]">
                VERA works for businesses of all sizes in any industry
              </p>
            </article>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Build a verified workforce</h2>
              <p className="text-lead max-w-xl">
                Join businesses that use VERA to verify credentials and make smarter hiring decisions.
              </p>
              <Link href="/contact" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Get in Touch <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
