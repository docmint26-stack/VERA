import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, ArrowRight, Check, User, Briefcase, GraduationCap, Award, FileText, Globe, Eye, Link2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { IntegrationPending } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Passport — Your Professional Identity",
  description: "Showcase your achievements, skills, and experience in a beautiful, verifiable digital passport.",
};

const FEATURES = [
  {
    icon: User,
    title: "Professional Profile",
    description: "Create a comprehensive profile with your photo, bio, and contact information.",
  },
  {
    icon: Briefcase,
    title: "Work Experience",
    description: "Document your professional journey with detailed work history and descriptions.",
  },
  {
    icon: GraduationCap,
    title: "Education",
    description: "List your educational background, degrees, and certifications.",
  },
  {
    icon: Award,
    title: "Achievements",
    description: "Highlight awards, recognition, and notable accomplishments.",
  },
  {
    icon: FileText,
    title: "Projects & Research",
    description: "Showcase your projects, publications, and research work.",
  },
  {
    icon: Globe,
    title: "Skills & Languages",
    description: "List your skills, competencies, and language proficiencies.",
  },
] as const;

const VERIFICATION_LEVELS = [
  {
    level: "Self-Reported",
    description: "Information you provide about yourself",
    icon: User,
    color: "text-[var(--muted-foreground)]",
    bg: "bg-[var(--surface)]",
  },
  {
    level: "AI-Assessed",
    description: "AI has analyzed your evidence and claims",
    icon: Check,
    color: "text-[var(--info)]",
    bg: "bg-[var(--info-soft)]",
  },
  {
    level: "Source-Corroborated",
    description: "External sources confirm your claims",
    icon: FileText,
    color: "text-[var(--status-corroborated)]",
    bg: "bg-[var(--status-corroborated-soft)]",
  },
  {
    level: "Issuer-Verified",
    description: "Issuer has cryptographically verified your credential",
    icon: BadgeCheck,
    color: "text-[var(--status-verified)]",
    bg: "bg-[var(--status-verified-soft)]",
  },
];

export default function PassportPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <BadgeCheck className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">My Passport — Your Professional Identity</h1>
              <p className="text-lead max-w-2xl">
                Build a comprehensive, verifiable profile that showcases your skills, experience, and achievements to the world.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/app/passport" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Open My Passport <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/features" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  All Features
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <IntegrationPending feature="Passport Sharing">
            Your passport data is saved locally. Public sharing and verification links will be available in Phase 2.
          </IntegrationPending>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Features"
            title="Build your professional story"
            description="Every aspect of your career and education, organized and verifiable."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <RevealOnScroll key={feature.title} delay={100}>
                <article className="surface-card flex flex-col gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-h4">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{feature.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="Verification Levels"
            title="From self-reported to issuer-verified"
            description="VERA clearly distinguishes between different levels of verification for complete transparency."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {VERIFICATION_LEVELS.map((level) => (
              <RevealOnScroll key={level.level} delay={200}>
                <article className="surface-card flex flex-col gap-3 p-5">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)]",
                      level.bg,
                      level.color,
                    )}
                  >
                    <level.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h4 className="font-medium">{level.level}</h4>
                  <p className="text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
                    {level.description}
                  </p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <RevealOnScroll>
            <div className="surface-soft rounded-[var(--radius-lg)] p-8 text-center">
              <Eye className="mx-auto h-8 w-8 text-[var(--brand)]" aria-hidden="true" />
              <h3 className="text-h3 mt-4">Share with Confidence</h3>
              <p className="mt-3 max-w-xl mx-auto text-[var(--muted-foreground)]">
                Share your passport with employers, colleagues, or anyone who needs to verify your credentials.
                Each claim shows its verification status clearly.
              </p>
              <Link2 className="mx-auto mt-4 h-6 w-6 text-[var(--brand)]" aria-hidden="true" />
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Ready to build your digital identity?</h2>
              <p className="text-lead max-w-xl">
                Start creating your passport and let your achievements speak for themselves.
              </p>
              <Link href="/app/passport" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Open My Passport <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}


