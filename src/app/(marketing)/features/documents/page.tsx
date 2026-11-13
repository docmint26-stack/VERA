import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowRight, LayoutTemplate, Type, List, Eye, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { IntegrationPending } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Document Studio — Create Beautiful Documents",
  description: "Create professional documents with AI assistance. Resumes, proposals, letters, and more — all in one place.",
};

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    description: "Start with expertly designed templates for resumes, cover letters, proposals, and more.",
  },
  {
    icon: Type,
    title: "Rich Text Editing",
    description: "Full-featured editor with headings, lists, bold, italic, and proper formatting.",
  },
  {
    icon: List,
    title: "Organized Structure",
    description: "Outline view, word count, and easy navigation to keep your documents organized.",
  },
  {
    icon: Eye,
    title: "Preview Mode",
    description: "See how your document looks before sharing or printing.",
  },
  {
    icon: Printer,
    title: "Print-Ready",
    description: "Clean, professional styling that looks great on screen and on paper.",
  },
] as const;

const TEMPLATES = [
  "Resume",
  "Cover Letter",
  "Business Proposal",
  "Research Summary",
  "Project Report",
  "Job Application",
  "Personal Statement",
  "Invoice",
  "Professional Letter",
  "Custom Document",
];

export default function DocumentsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <FileText className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">Document Studio — Create Beautiful Documents</h1>
              <p className="text-lead max-w-2xl">
                Write, format, and perfect your documents with AI assistance. From resumes to research papers, create professional content effortlessly.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/app/documents" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Open Document Studio <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/features" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  All Features
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <IntegrationPending feature="Document Export">
            Documents are saved locally in your browser. Cloud persistence and export to PDF/DOCX will be
            available in Phase 2.
          </IntegrationPending>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Features"
            title="Powerful document creation tools"
            description="Everything you need to create professional, polished documents."
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
            eyebrow="Templates"
            title="Start with a template"
            description="Choose from our collection of professionally designed templates to get started quickly."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {TEMPLATES.map((template) => (
              <RevealOnScroll key={template} delay={200}>
                <article className="surface-card flex items-center gap-3 p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{template}</span>
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
              <h2 className="text-h2 max-w-2xl text-balance">Ready to create your next document?</h2>
              <p className="text-lead max-w-xl">
                Start with a template or a blank page. Your documents are saved automatically.
              </p>
              <Link href="/app/documents" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Open Document Studio <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
