import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, ArrowRight, User, FileText, Award, Search, Network, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "VERA for Professionals — Advance Your Career",
  description: "Manage your professional identity, verify credentials, and showcase achievements to advance your career.",
};

const BENEFITS = [
  { icon: User, title: "Professional Profile", description: "Create a comprehensive profile that showcases your experience, skills, and achievements." },
  { icon: FileText, title: "Document Management", description: "Store and organize all your professional documents in one secure vault." },
  { icon: Award, title: "Credential Verification", description: "Verify your degrees, certifications, and professional licenses with cryptographic proof." },
  { icon: Search, title: "Opportunity Discovery", description: "Find jobs, gigs, and projects that match your skills and experience." },
  { icon: Network, title: "Professional Network", description: "Connect with other professionals and share verified achievements." },
  { icon: Star, title: "Reputation Building", description: "Build a portable reputation that follows you throughout your career." },
];

const USE_CASES = [
  { title: "Job Applications", description: "Create tailored resumes and cover letters with verified credentials." },
  { title: "Freelance Work", description: "Showcase your portfolio and verify client testimonials." },
  { title: "Consulting", description: "Present verified case studies and client references." },
  { title: "Promotion", description: "Document your achievements to support internal promotion applications." },
  { title: "Networking", description: "Share your verifiable profile with new connections and potential employers." },
  { title: "Continuing Education", description: "Track certifications and professional development activities." },
];

export default function ProfessionalsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Briefcase className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA for Professionals — Advance Your Career</h1>
              <p className="text-lead max-w-2xl">
                In a competitive world, your credibility is everything. VERA helps you build, verify, and showcase a professional identity that opens doors.
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
          <SectionHeading eyebrow="Benefits" title="Professional advantages" description="Features designed for career growth." />
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
          <SectionHeading eyebrow="Use Cases" title="How professionals use VERA" description="Practical applications for career development." />
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

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Build a career without limits</h2>
              <p className="text-lead max-w-xl">
                Join professionals worldwide who use VERA to verify their achievements and advance their careers.
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
