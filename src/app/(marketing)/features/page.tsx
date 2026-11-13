import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  FolderLock,
  BadgeCheck,
  Award,
  Coins,
  Compass,
  ArrowRight,
  Check,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { IntegrationPending } from "@/components/ui/alert";
import { Section, SectionHeading, SplitSection } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Every module in VERA: AI chat, Document Studio, My Vault, My Passport, Achievements, Verification, Rewards, Opportunities and Platform Admin.",
};

const MODULES = [
  {
    id: "ai",
    icon: Sparkles,
    name: "VERA AI",
    status: "Interface ready · provider pending",
    points: [
      "Streaming-style chat layout with composer, attachments and conversation history",
      "Sample responses are explicitly labelled as illustrative, never passed off as live output",
      "Stop, retry, copy and rename controls on every message",
    ],
  },
  {
    id: "documents",
    icon: FileText,
    name: "Document Studio",
    status: "Interface ready · export pending",
    points: [
      "Ten document templates: resume, cover letter, proposal, research summary and more",
      "Rich-text editing with outline, word count and print styles",
      "Autosave to this browser with a visible local-only indicator",
    ],
  },
  {
    id: "vault",
    icon: FolderLock,
    name: "My Vault",
    status: "Interface ready · cloud storage pending",
    points: [
      "Folder tree, search, starred items and a trash view",
      "Drag-and-drop upload with animated per-file progress",
      "In-browser preview for images, PDFs and text",
    ],
  },
  {
    id: "passport",
    icon: BadgeCheck,
    name: "My Passport",
    status: "Interface ready · sharing pending",
    points: [
      "Skills, experience, education, projects, certifications and research",
      "Every entry can be marked self-reported or linked to evidence",
      "Public preview with visibility controls and a shareable link",
    ],
  },
  {
    id: "achievements",
    icon: Award,
    name: "Achievements",
    status: "Interface ready · submission backend pending",
    points: [
      "Four-step wizard: type, claim details, evidence, review",
      "Draft persistence so an interrupted submission is never lost",
      "Clear separation between what you claim and what has been checked",
    ],
  },
  {
    id: "verification",
    icon: Check,
    name: "Verification",
    status: "Interface ready · crypto checks pending",
    points: [
      "Visual journey across evidence, assessment, source and issuer stages",
      "Public credential inspection page for anyone with the link",
      "Honest banners for every check that has not been performed",
    ],
  },
  {
    id: "rewards",
    icon: Coins,
    name: "Rewards",
    status: "Demo data",
    points: [
      "Points balance, earning history and available benefits",
      "Rules stated plainly: no cash value, no transfer, no trading",
      "Animated point accumulation that respects reduced motion",
    ],
  },
  {
    id: "opportunities",
    icon: Compass,
    name: "Opportunities",
    status: "Demo listings",
    points: [
      "Filters for jobs, internships, freelance, scholarships, training and collaborations",
      "Save and shortlist with local persistence",
      "Suggested section driven by your stated goals",
    ],
  },
] as const;

export default function FeaturesPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Product"
            title="Everything VERA ships in this preview"
            description="Each module below is implemented as a working interface. Where a module depends on a service that does not exist yet, it says so in plain language."
          />
          <div className="mx-auto mt-10 max-w-xl">
            <IntegrationPending feature="Module dependencies">
              Modules that need a backend show demonstration data or a local-only state. Nothing silently
              pretends to have succeeded.
            </IntegrationPending>
          </div>
        </div>
      </Section>

      {MODULES.map((module, index) => (
        <Section
          key={module.id}
          id={module.id}
          tone={index % 2 === 1 ? "soft" : "default"}
          className={index === 0 ? "pt-0" : ""}
        >
          <div className="container-page">
            <SplitSection
              reverse={index % 2 === 1}
              eyebrow={<span className="flex items-center gap-2"><module.icon className="h-4 w-4" aria-hidden="true" />{module.name}</span>}
              title={module.name}
              description={module.status}
            >
              <div className="surface-card p-6">
                <ul className="space-y-3.5">
                  {module.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                      <span className="text-[var(--muted-foreground)]">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SplitSection>
          </div>
        </Section>
      ))}

      <Section tone="brand">
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="text-h1 max-w-2xl text-balance">See it all in one workspace</h2>
          <p className="text-lead max-w-xl">
            Modules share navigation, search, keyboard shortcuts and the same visual language — so nothing
            feels bolted on.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ variant: "primary", size: "xl" })}>
              Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "xl" })}>
              How it works
            </Link>
          </div>
          <RevealOnScroll>
            <IntegrationPending feature="Platform Admin role">
              Organisation and platform administration screens exist behind a role gate; role checks become
              server-enforced in Phase 2.
            </IntegrationPending>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
