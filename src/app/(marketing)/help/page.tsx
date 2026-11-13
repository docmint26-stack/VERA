import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, LifeBuoy, Mail, MessageSquare, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Kbd } from "@/components/ui/kbd";
import { Section, SectionHeading } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "Help",
  description:
    "Guides, keyboard shortcuts and answers for the VERA Phase 1 preview, plus how to reach us.",
};

const TOPICS = [
  {
    icon: BookOpen,
    title: "Getting started",
    body: "Sign in with the demo account, complete the five-step onboarding, then work through the dashboard checklist.",
    href: "/signin",
    cta: "Sign in",
  },
  {
    icon: Sparkles,
    title: "Product tour",
    body: "A short walkthrough of what each module does and which parts are demonstration data.",
    href: "/how-it-works",
    cta: "See how it works",
  },
  {
    icon: LifeBuoy,
    title: "Trust & verification",
    body: "What each verification status means, and why a badge is never a promise beyond what was checked.",
    href: "/trust",
    cta: "Read the guide",
  },
] as const;

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], action: "Open the command palette" },
  { keys: ["Esc"], action: "Close a dialog, menu or palette" },
  { keys: ["Enter"], action: "Send an AI message" },
  { keys: ["Shift", "Enter"], action: "New line in a message" },
] as const;

const QUESTIONS = [
  {
    q: "Where is my data stored?",
    a: "Nowhere but your browser. Documents, files, profile details and settings live in local storage on this device. Clearing site data clears your workspace.",
  },
  {
    q: "Why does something say “awaiting integration”?",
    a: "Because it needs a server. Storage, email, AI providers, payment processing and institutional verification all arrive in later phases. The interface says so instead of pretending.",
  },
  {
    q: "Is the AI assistant real?",
    a: "The conversation interface is complete, including keyboard behaviour and accessibility. Replies are labelled sample text until a provider is connected in Phase 3.",
  },
  {
    q: "How do I switch language or theme?",
    a: "Both live in the top bar and in Settings. English and বাংলা are available across navigation, actions, forms and core messages; light, dark and system themes follow your preference.",
  },
  {
    q: "How do I report a problem?",
    a: "Use the contact form. Include the page you were on and what you expected to happen — that is usually enough to reproduce it.",
  },
] as const;

export default function HelpPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Help"
            title="How can we help?"
            description="Guides for the Phase 1 preview, keyboard shortcuts, and a direct line to us."
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page">
          <ul className="grid gap-4 md:grid-cols-3">
            {TOPICS.map((topic) => (
              <li key={topic.title} className="surface-card flex flex-col gap-3 p-5">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]"
                >
                  <topic.icon className="h-[18px] w-[18px]" />
                </span>
                <h2 className="text-h4">{topic.title}</h2>
                <p className="flex-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {topic.body}
                </p>
                <Link
                  href={topic.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--brand)] hover:underline"
                >
                  {topic.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section>
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <h2 className="text-h3">Common questions</h2>
            <Accordion type="multiple" className="mt-4">
              {QUESTIONS.map((item, index) => (
                <AccordionItem key={item.q} value={`help-${index}`}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-6 text-sm text-[var(--muted-foreground)]">
              More detail lives in the{" "}
              <Link href="/faq" className="font-medium text-[var(--brand)] hover:underline">
                full FAQ
              </Link>
              .
            </p>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="surface-card p-5">
              <p className="flex items-center gap-2 text-overline uppercase tracking-wider text-[var(--muted-foreground)]">
                <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" aria-hidden="true" />
                Keyboard shortcuts
              </p>
              <ul className="mt-4 space-y-3">
                {SHORTCUTS.map((shortcut) => (
                  <li key={shortcut.action} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[var(--muted-foreground)]">{shortcut.action}</span>
                    <span className="flex shrink-0 gap-1">
                      {shortcut.keys.map((key) => (
                        <Kbd key={key}>{key}</Kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="surface-card p-5">
              <p className="flex items-center gap-2 text-overline uppercase tracking-wider text-[var(--muted-foreground)]">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--brand)]" aria-hidden="true" />
                Still stuck?
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                Tell us what you were trying to do and we will get back to you by email.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/contact" className={buttonVariants({ variant: "primary", size: "sm" })}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Contact support
                </Link>
                <Link href="/app/help" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                  In-app help
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
