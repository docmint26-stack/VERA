import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  IdCard,
  FileText,
  LifeBuoy,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { IntegrationPending } from "@/components/ui/alert";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealGroup } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides, explainers and keyboard shortcuts for getting the most out of VERA.",
};

const GUIDES = [
  {
    icon: BookOpen,
    title: "Getting started",
    href: "/how-it-works",
    body: "The four-step walkthrough from a blank workspace to a shareable credential.",
  },
  {
    icon: ShieldCheck,
    title: "Understanding verification",
    href: "/trust",
    body: "What each status label means and which checks have actually been performed.",
  },
  {
    icon: IdCard,
    title: "Building your Passport",
    href: "/features#passport",
    body: "Structure skills, experience and projects so a reader can follow them.",
  },
  {
    icon: FileText,
    title: "Creating documents",
    href: "/features#documents",
    body: "Templates, autosave behaviour and how local drafts are stored.",
  },
] as const;

const SHORTCUTS = [
  { keys: ["Ctrl/⌘", "K"], action: "Open the command palette" },
  { keys: ["Ctrl/⌘", "/"], action: "Show keyboard shortcuts" },
  { keys: ["Esc"], action: "Close the current dialog or panel" },
  { keys: ["G", "then", "D"], action: "Go to dashboard" },
  { keys: ["G", "then", "A"], action: "Go to VERA AI" },
  { keys: ["N"], action: "New document (from the Documents library)" },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Resources"
            title="Guides, explainers and shortcuts"
            description="Everything here is written for someone using VERA for the first time."
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page">
          <RevealGroup className="grid gap-5 sm:grid-cols-2">
            {GUIDES.map((guide) => (
              <Link
                key={guide.title}
                href={guide.href}
                className="surface-card group flex gap-4 p-6 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)] focus-ring"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                  <guide.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-h4">
                    {guide.title}
                    <ArrowRight
                      className="h-4 w-4 text-[var(--muted-foreground)] transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-[var(--muted-foreground)]">
                    {guide.body}
                  </span>
                </span>
              </Link>
            ))}
          </RevealGroup>
        </div>
      </Section>

      <Section id="shortcuts">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="flex flex-col gap-4">
              <p className="text-overline">Keyboard</p>
              <h2 className="text-h2">Move faster without the mouse</h2>
              <p className="text-lead">
                The same shortcuts work across every module. On macOS, use ⌘ in place of Ctrl.
              </p>
              <Link href="/help" className={buttonVariants({ variant: "secondary", size: "lg", className: "self-start" })}>
                <LifeBuoy className="h-4 w-4" aria-hidden="true" /> Help &amp; support
              </Link>
            </div>

            <ul className="divide-y divide-[var(--divider)] rounded-[var(--radius-md)] border border-[var(--border)]">
              {SHORTCUTS.map((shortcut) => (
                <li key={shortcut.action} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <span className="text-sm text-[var(--muted-foreground)]">{shortcut.action}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {shortcut.keys.map((key, index) => (
                      <kbd
                        key={`${key}-${index}`}
                        className="rounded-[5px] border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[0.6875rem] text-[var(--foreground)]"
                      >
                        {key}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <IntegrationPending feature="Video and downloadable tutorials">
              Guided in-product tours ship with the onboarding flow; recorded walkthroughs arrive later.
            </IntegrationPending>
          </div>
        </div>
      </Section>
    </>
  );
}
