import Link from "next/link";
import {
  Sparkles,
  FileText,
  FolderLock,
  BadgeCheck,
  Award,
  Coins,
  ArrowRight,
  Check,
  ShieldCheck,
  Eye,
  UserRound,
  Building2,
  GraduationCap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VeraLogo } from "@/components/branding/vera-logo";
import { ProductMock, HeroBackdrop } from "@/components/marketing/product-mock";
import { Section, SectionHeading, StatRow } from "@/components/marketing/section";
import { RevealOnScroll, RevealGroup } from "@/components/motion/reveal-on-scroll";
import { T } from "@/components/i18n/t";

const FEATURES = [
  {
    id: "ai",
    icon: Sparkles,
    title: "VERA AI",
    body: "A chat workspace that drafts, plans and explains — with attachments, conversation history and an explicit note when content is illustrative.",
  },
  {
    id: "documents",
    icon: FileText,
    title: "Document Studio",
    body: "Rich-text editor with templates for CVs, proposals and reports. Drafts autosave locally while export formats wait for Phase 3.",
  },
  {
    id: "vault",
    icon: FolderLock,
    title: "My Vault",
    body: "Organise files into folders, preview them in the browser and see exactly what is stored on this device versus in the cloud.",
  },
  {
    id: "passport",
    icon: BadgeCheck,
    title: "My Passport",
    body: "A shareable professional profile: skills, experience, education, projects and the evidence behind each claim.",
  },
  {
    id: "verification",
    icon: ShieldCheck,
    title: "Verification",
    body: "Watch a claim move from submission to assessment, source corroboration and issuer sign-off — with a public inspection page.",
  },
  {
    id: "rewards",
    icon: Coins,
    title: "Rewards",
    body: "Earn VERA Points for meaningful participation. Clearly labelled as internal, non-transferable and never money.",
  },
] as const;

const JOURNEY = [
  {
    step: "01",
    title: "Evidence",
    body: "You submit a claim with a document, a link or a written record of where it can be checked.",
  },
  {
    step: "02",
    title: "Assessment",
    body: "An automated review summarises what the evidence does and does not support.",
  },
  {
    step: "03",
    title: "Source corroboration",
    body: "Key details are matched against an independent source rather than taken at face value.",
  },
  {
    step: "04",
    title: "Issuer verification",
    body: "The issuing organisation confirms the credential, which becomes a shareable, revocable record.",
  },
] as const;

const AUDIENCES = [
  {
    icon: UserRound,
    title: "Individuals",
    body: "Build a record of what you have actually done and share it with anyone, in one link.",
  },
  {
    icon: Building2,
    title: "Organisations",
    body: "Issue and manage credentials for your people, with a review queue and audit trail.",
  },
  {
    icon: GraduationCap,
    title: "Learners & researchers",
    body: "Turn courses, projects and publications into structured, checkable achievements.",
  },
] as const;

const FAQS = [
  {
    q: "Is VERA a blockchain product?",
    a: "No. VERA is a personal workspace and a verification workflow. Cryptographic and on-chain checks are planned for Phase 4; nothing in Phase 1 has been validated on-chain.",
  },
  {
    q: "What actually works in this preview?",
    a: "The full interface: marketing site, authentication screens, onboarding, dashboard, AI chat UI, documents, vault, passport, achievements, verification, rewards, opportunities, settings and help. Data is local to your browser. No backend, AI provider, payment or wallet is connected yet.",
  },
  {
    q: "Are the rewards real money?",
    a: "No. VERA Points are internal participation points with no monetary value, no trading and no guaranteed benefit.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <Section className="relative overflow-hidden pt-14 sm:pt-20 md:pt-24">
        <HeroBackdrop />
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <RevealOnScroll className="flex flex-col gap-6">
              <p className="text-overline">
                <T k="brand.fullName" />
              </p>
              <h1 className="text-display text-balance">
                Your life. Your work. <span className="text-[var(--brand)]">Your proof.</span>
              </h1>
              <p className="text-lead max-w-xl">
                VERA is an AI-powered personal workspace and verifiable trust network. Create with AI,
                organise what matters, prove your achievements, and take a reputation you can actually
                back up anywhere you go.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className={buttonVariants({ variant: "primary", size: "xl" })}
                >
                  <T k="nav.getStarted" />
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/signin"
                  className={buttonVariants({ variant: "secondary", size: "xl" })}
                >
                  <T k="nav.signIn" />
                </Link>
                <Link href="/how-it-works" className="text-sm font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm px-1">
                  <T k="nav.howItWorks" /> →
                </Link>
              </div>

              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                {["No credit card", "Works in your browser", "Export your data"].map((item) => (
                  <li key={item} className="flex items-center gap-1.5 text-caption">
                    <Check className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </RevealOnScroll>

            <RevealOnScroll delay={120} className="relative">
              <ProductMock />
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={200} className="mt-16">
            <IntegrationPending feature="Live product services">
              Everything you can click is real. Authentication, AI, storage, verification and payments run
              locally or show demonstration data until later phases.
            </IntegrationPending>
          </RevealOnScroll>
        </div>
      </Section>

      {/* ------------------------------------------------------- Features */}
      <Section id="features" tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="What you get"
            title="One workspace for asking, creating and proving"
            description="Six modules that share a single design language, a single search and a single command palette."
          />

          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.id}
                id={feature.id}
                className="surface-card group flex flex-col gap-3 p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)] transition-transform duration-200 group-hover:scale-105">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-h4">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{feature.body}</p>
              </article>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* ---------------------------------------------------- How it works */}
      <Section id="how-it-works">
        <div className="container-page">
          <SectionHeading
            eyebrow="How it works"
            title="Three moves, then proof you can share"
            description="VERA keeps the workflow short so the hard part — backing a claim up — is the part that gets attention."
          />

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Ask and create",
                body: "Start from a prompt or a template. VERA AI drafts, the Document Studio shapes it, and the Vault keeps the source material beside it.",
              },
              {
                step: "2",
                title: "Organise and claim",
                body: "Turn work into structured achievements with dates, issuers and supporting evidence attached to each claim.",
              },
              {
                step: "3",
                title: "Verify and share",
                body: "Send it through the verification journey and publish a Passport link anyone can inspect.",
              },
            ].map((item, index) => (
              <li key={item.step} className="relative">
                <RevealOnScroll index={index} className="flex h-full flex-col gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--foreground)] text-sm font-semibold text-[var(--background)]">
                    {item.step}
                  </span>
                  <h3 className="text-h4">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{item.body}</p>
                </RevealOnScroll>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <Link href="/how-it-works" className={buttonVariants({ variant: "link" })}>
              See the full walkthrough <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------- Verification */}
      <Section tone="soft">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="flex flex-col gap-4">
              <p className="text-overline">Trust &amp; verification</p>
              <h2 className="text-h2 text-balance">
                A claim is only as good as the path it took to get checked
              </h2>
              <p className="text-lead">
                VERA never presents a self-declared statement as a verified fact. Every credential shows
                which stage it reached, what evidence supported it, and who confirmed it.
              </p>
              <Link href="/trust" className={buttonVariants({ variant: "secondary", size: "lg", className: "self-start" })}>
                How verification works <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <ol className="relative space-y-4 before:absolute before:left-[19px] before:top-3 before:h-[calc(100%-24px)] before:w-px before:bg-[var(--border)]">
              {JOURNEY.map((stage, index) => (
                <li key={stage.step}>
                  <RevealOnScroll index={index} className="relative flex gap-4">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[0.75rem] font-semibold tabular-nums text-[var(--brand)]">
                      {stage.step}
                    </span>
                    <div className="surface-card flex-1 p-4">
                      <h3 className="text-h4">{stage.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
                        {stage.body}
                      </p>
                    </div>
                  </RevealOnScroll>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------ Audiences */}
      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="Who it's for"
            title="Built for people who need their work to travel"
            description="A student, an employee and an organisation all need the same thing: a record that survives outside the room it was made in."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {AUDIENCES.map((audience) => (
              <div key={audience.title} className="surface-soft flex flex-col gap-3 p-6">
                <audience.icon className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
                <h3 className="text-h4">{audience.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{audience.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------- Trust strip */}
      <Section tone="soft">
        <div className="container-page space-y-10">
          <StatRow
            items={[
              { value: "4", label: "Verification stages" },
              { value: "11", label: "Product modules" },
              { value: "2", label: "Languages at launch" },
              { value: "0", label: "Hidden paywalls" },
            ]}
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Eye,
                title: "Nothing is sent anywhere yet",
                body: "In Phase 1 your drafts, files and profile live in this browser. Clearing site data removes them.",
              },
              {
                icon: ShieldCheck,
                title: "Verification is never faked",
                body: "Every stage is labelled honestly, including the ones that have not been connected to a real service.",
              },
              {
                icon: Award,
                title: "Rewards are not currency",
                body: "Points are participation markers. They cannot be sold, transferred or exchanged for money.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
                <div>
                  <h3 className="text-h4">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- FAQ */}
      <Section id="faq">
        <div className="container-page max-w-3xl">
          <SectionHeading eyebrow="Questions" title="Straight answers" />
          <Accordion type="single" collapsible className="mt-10">
            {FAQS.map((faq, index) => (
              <AccordionItem key={faq.q} value={`faq-${index}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 text-center">
            <Link href="/faq" className={buttonVariants({ variant: "link" })}>
              All questions <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------ CTA band */}
      <Section tone="brand">
        <div className="container-page flex flex-col items-center gap-6 text-center">
          <VeraLogo layout="icon" size="lg" href={null} />
          <h2 className="text-h1 max-w-2xl text-balance">Ask. Create. Prove.</h2>
          <p className="text-lead max-w-xl">
            Set up your workspace in about a minute. Explore every module before you decide whether VERA
            is for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className={buttonVariants({ variant: "primary", size: "xl" })}>
              <T k="nav.getStarted" />
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/signin" className={buttonVariants({ variant: "secondary", size: "xl" })}>
              <T k="nav.signIn" />
            </Link>
          </div>
          <Alert variant="info" className="max-w-xl text-left">
            <T k="common.phase1Note" />
          </Alert>
        </div>
      </Section>
    </>
  );
}
