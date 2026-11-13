import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowRight, Check, MessageSquare, Bot, Paperclip, History, Copy, RefreshCw, StopCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { IntegrationPending } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "VERA AI — Intelligent Assistant",
  description: "Ask VERA anything. Get clear, contextual answers with proper citations. Your AI companion for work and learning.",
};

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Chat with VERA in plain language. No need to learn special commands or syntax.",
  },
  {
    icon: Bot,
    title: "Context-Aware",
    description: "VERA remembers your documents, achievements, and preferences to provide relevant responses.",
  },
  {
    icon: Paperclip,
    title: "Attachments",
    description: "Upload files and reference them in your conversations for more accurate results.",
  },
  {
    icon: History,
    title: "Conversation History",
    description: "Pick up where you left off. All your chat history is saved and searchable.",
  },
  {
    icon: Copy,
    title: "Easy Export",
    description: "Copy responses, save as documents, or export entire conversations.",
  },
  {
    icon: RefreshCw,
    title: "Regenerate & Retry",
    description: "Not happy with the answer? Regenerate or refine your prompt with one click.",
  },
  {
    icon: StopCircle,
    title: "Stop Generation",
    description: "Interrupt long responses at any time to provide new input.",
  },
] as const;

const USE_CASES = [
  {
    category: "Documents",
    items: ["Resume creation and optimization", "Cover letter drafting", "Business proposal writing", "Research summary generation"],
  },
  {
    category: "Learning",
    items: ["Explain complex concepts simply", "Create study guides", "Generate practice questions", "Summarize long articles"],
  },
  {
    category: "Professional",
    items: ["Job application preparation", "Interview question practice", "Portfolio content creation", "LinkedIn profile optimization"],
  },
] as const;

export default function AIPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Sparkles className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA AI — Your Intelligent Assistant</h1>
              <p className="text-lead max-w-2xl">
                Ask questions, generate content, analyze information, and get work done faster with AI that understands your context.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/app/ai" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Try VERA AI <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  How it works
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <IntegrationPending feature="AI Service">
            The AI chat interface is fully functional. AI responses are currently using demonstration mode and
            are explicitly labeled as sample content.
          </IntegrationPending>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Features"
            title="Everything you need from an AI assistant"
            description="Built for real work, not just demos. VERA AI helps you get things done."
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
            eyebrow="Use Cases"
            title="What you can do with VERA AI"
            description="From drafting documents to learning new skills, VERA AI adapts to your needs."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {USE_CASES.map((category) => (
              <RevealOnScroll key={category.category} delay={200}>
                <article className="surface-card p-6">
                  <h3 className="text-h4 mb-4">{category.category}</h3>
                  <ul className="space-y-3">
                    {category.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
              <h2 className="text-h2 max-w-2xl text-balance">Ready to experience intelligent assistance?</h2>
              <p className="text-lead max-w-xl">
                Start chatting with VERA AI and discover how it can transform your workflow.
              </p>
              <Link href="/app/ai" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Open VERA AI <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
