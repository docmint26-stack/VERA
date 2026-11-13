import type { Metadata } from "next";
import Link from "next/link";
import { Coins, ArrowRight, Check, Trophy, Gift, Star, TrendingUp, History } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { IntegrationPending } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Rewards — Earn VERA Points",
  description: "Earn VERA Points for participation and engagement. Unlock benefits and recognition.",
};

const FEATURES = [
  {
    icon: Coins,
    title: "Earn Points",
    description: "Complete tasks, engage with the platform, and earn VERA Points for your contributions.",
  },
  {
    icon: History,
    title: "Activity History",
    description: "Track all your earning and redemption activity with detailed timestamps.",
  },
  {
    icon: Trophy,
    title: "Achievement Rewards",
    description: "Earn bonus points for reaching milestones and completing challenges.",
  },
  {
    icon: Gift,
    title: "Redemption Benefits",
    description: "Redeem your points for platform benefits, features, and recognition.",
  },
  {
    icon: TrendingUp,
    title: "Leaderboards",
    description: "See how you rank among other VERA users and compete for the top spots.",
  },
  {
    icon: Star,
    title: "Badges & Recognition",
    description: "Earn badges for your achievements and display them on your profile.",
  },
] as const;

const EARNING_OPPORTUNITIES = [
  {
    action: "Complete Profile",
    points: "100",
    description: "Fill out your passport profile completely",
  },
  {
    action: "Submit Achievement",
    points: "50",
    description: "Submit a new achievement for verification",
  },
  {
    action: "Verify Credential",
    points: "200",
    description: "Successfully verify a credential",
  },
  {
    action: "Refer a Friend",
    points: "150",
    description: "Invite a friend who signs up",
  },
  {
    action: "Daily Login",
    points: "10",
    description: "Log in to VERA every day",
  },
  {
    action: "Complete Onboarding",
    points: "100",
    description: "Finish the onboarding tutorial",
  },
];

const REDEMPTION_OPTIONS = [
  {
    name: "Premium Template",
    points: "500",
    description: "Access to exclusive document templates",
  },
  {
    name: "Profile Badge",
    points: "200",
    description: "Display a special badge on your passport",
  },
  {
    name: "Storage Upgrade",
    points: "1000",
    description: "Additional cloud storage for your vault",
  },
  {
    name: "AI Priority",
    points: "800",
    description: "Priority access during high-demand periods",
  },
  {
    name: "Feature Preview",
    points: "1500",
    description: "Early access to new VERA features",
  },
  {
    name: "Charity Donation",
    points: "2000",
    description: "Donate to a supported charity in your name",
  },
];

const RULES = [
  "VERA Points are internal utility points with no cash value",
  "Points cannot be transferred, traded, or exchanged for money",
  "VERA reserves the right to modify reward values and availability",
  "Points expire after 24 months of account inactivity",
  "Redemptions are subject to availability and platform limits",
  "VERA Points are not a cryptocurrency, investment, or financial instrument",
];

export default function RewardsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Coins className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">Rewards — Earn VERA Points</h1>
              <p className="text-lead max-w-2xl">
                Participate, contribute, and engage with VERA to earn points. Unlock benefits, features, and recognition as you build your reputation.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/app/rewards" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  View My Rewards <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/features" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  All Features
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <IntegrationPending feature="Rewards Backend">
            The rewards interface is fully implemented with demonstration data. Actual earning, redemption, and
            tracking will be available in Phase 2.
          </IntegrationPending>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Features"
            title="A complete rewards system"
            description="Earn, track, and redeem points with full transparency."
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
            eyebrow="Earning Opportunities"
            title="Ways to earn VERA Points"
            description="Complete these actions to start earning points immediately."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {EARNING_OPPORTUNITIES.map((opportunity) => (
              <RevealOnScroll key={opportunity.action} delay={200}>
                <article className="surface-card flex items-center gap-4 p-5">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--success-soft)] text-[var(--success)] font-bold">
                      {opportunity.points}
                    </span>
                    <span className="text-[0.6875rem] text-[var(--muted-foreground)] mt-1">pts</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{opportunity.action}</h4>
                    <p className="text-[0.8125rem] text-[var(--muted-foreground)]">{opportunity.description}</p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Redemption Options"
            title="Redeem your points for benefits"
            description="Trade your hard-earned points for valuable platform features and recognition."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {REDEMPTION_OPTIONS.map((option) => (
              <RevealOnScroll key={option.name} delay={200}>
                <article className="surface-card flex items-center gap-4 p-5">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)] font-bold">
                      {option.points}
                    </span>
                    <span className="text-[0.6875rem] text-[var(--muted-foreground)] mt-1">pts</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{option.name}</h4>
                    <p className="text-[0.8125rem] text-[var(--muted-foreground)]">{option.description}</p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="Rules & Information"
            title="Important things to know"
            description="Understand how VERA Points work and what they can be used for."
          />
          <div className="mt-10 surface-soft rounded-[var(--radius-md)] p-6">
            <ul className="space-y-3">
              {RULES.map((rule, index) => (
                <RevealOnScroll key={index} delay={300}>
                  <li className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                    <span>{rule}</span>
                  </li>
                </RevealOnScroll>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Ready to start earning?</h2>
              <p className="text-lead max-w-xl">
                Join the VERA community and begin earning points for your contributions.
              </p>
              <Link href="/app/rewards" className={buttonVariants({ variant: "primary", size: "xl" })}>
                View My Rewards <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
