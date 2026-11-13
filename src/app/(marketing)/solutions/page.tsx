import type { Metadata } from "next";
import Link from "next/link";
import {
  UserRound,
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  ArrowRight,
  Check,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealGroup } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "How individuals, organisations, learners, job seekers and teams use VERA to create, organise and prove their work.",
};

const SOLUTIONS = [
  {
    id: "individuals",
    icon: UserRound,
    title: "For individuals",
    lead: "Keep every piece of your work in one place and let it speak for itself.",
    outcomes: [
      "A single link that shows what you have done and how it was checked",
      "AI assistance that drafts from your own material, not generic filler",
      "A vault that keeps source documents next to the claims they support",
    ],
  },
  {
    id: "job-seekers",
    icon: Briefcase,
    title: "For job seekers",
    lead: "Apply with evidence instead of adjectives.",
    outcomes: [
      "Resume and cover-letter templates that start from your Passport",
      "Achievements with dates, issuers and attachments already attached",
      "Verification status visible to a recruiter before the interview",
    ],
  },
  {
    id: "learners",
    icon: GraduationCap,
    title: "For learners and researchers",
    lead: "Turn courses, projects and papers into a structured record.",
    outcomes: [
      "Capture training and certifications while they are still fresh",
      "Link publications and research to the work that produced them",
      "Export a clean, printable summary of your academic activity",
    ],
  },
  {
    id: "organisations",
    icon: Building2,
    title: "For organisations",
    lead: "Issue credentials your people can actually prove.",
    outcomes: [
      "An issuance flow with a review queue and audit log",
      "Roles for admins, reviewers and issuing staff",
      "Revocation that propagates to every shared link",
    ],
  },
  {
    id: "teams",
    icon: Users,
    title: "For small teams",
    lead: "Shared context without a shared spreadsheet.",
    outcomes: [
      "Common documents and templates in one workspace",
      "Clear ownership on every file and draft",
      "Activity history so handovers are not guesswork",
    ],
  },
] as const;

export default function SolutionsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Solutions"
            title="Different goals, one honest workflow"
            description="VERA does not change its story depending on who is reading. The same four-stage verification applies to a student, a contractor and a company."
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page">
          <RevealGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((solution) => (
              <article
                key={solution.id}
                id={solution.id}
                className="surface-card flex flex-col gap-3.5 p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <solution.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-h4">{solution.title}</h2>
                <p className="text-sm font-medium text-[var(--foreground)]">{solution.lead}</p>
                <ul className="mt-1 space-y-2.5">
                  {solution.outcomes.map((outcome) => (
                    <li key={outcome} className="flex gap-2.5 text-sm leading-relaxed text-[var(--muted-foreground)]">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--success)]" aria-hidden="true" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <div className="surface-soft flex flex-col items-center gap-5 p-8 text-center sm:p-12">
            <h2 className="text-h2 max-w-xl text-balance">Not sure which one you are?</h2>
            <p className="text-lead max-w-lg">
              Most people are two of these at once. VERA asks what you want to do first during onboarding
              and reshapes the dashboard around it — you can change it later.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
                Start onboarding <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                See how it works
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
