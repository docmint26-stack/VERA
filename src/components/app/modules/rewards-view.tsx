"use client";

import * as React from "react";
import { Coins, Gift, History, Info, Sparkles } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/popover";
import { ProgressRing } from "@/components/motion/progress-ring";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { RewardCoinAnimation } from "@/components/motion/reward-coin";
import { useT } from "@/components/i18n/language-provider";
import { DEMO_REWARDS, REWARDS_BALANCE } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const TIERS = [
  { id: "explorer", name: "Explorer", threshold: 0 },
  { id: "contributor", name: "Contributor", threshold: 250 },
  { id: "verified", name: "Verified", threshold: 500 },
  { id: "ambassador", name: "Ambassador", threshold: 1000 },
] as const;

const BENEFITS = [
  { key: "benefitProfileBoost", cost: 250 },
  { key: "benefitPriorityReview", cost: 400 },
  { key: "benefitExportPack", cost: 600 },
] as const;

const NEXT_TIER = TIERS.find((tier) => tier.threshold > REWARDS_BALANCE) ?? TIERS[TIERS.length - 1];
const PREV_TIER = [...TIERS].reverse().find((tier) => tier.threshold <= REWARDS_BALANCE) ?? TIERS[0];
const RANGE = Math.max(NEXT_TIER.threshold - PREV_TIER.threshold, 1);
const TIER_PROGRESS = Math.round(((REWARDS_BALANCE - PREV_TIER.threshold) / RANGE) * 100);

const KIND_TONE: Record<string, string> = {
  earned: "text-[var(--success)]",
  redeemed: "text-[var(--muted-foreground)]",
  pending: "text-[var(--warning)]",
};

export function RewardsView() {
  const t = useT();
  const [awarded, setAwarded] = React.useState(false);
  const [redeemedKey, setRedeemedKey] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <RewardCoinAnimation
        show={awarded}
        amount={25}
        label={t("rewards.points")}
        onDone={() => setAwarded(false)}
      />

      <PageHeader
        title={t("rewards.title")}
        description={t("rewards.subtitle")}
        actions={
          <>
            <Button variant="secondary" onClick={() => setAwarded(true)}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t("rewards.earnCompleteProfile")}
            </Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="surface-card flex flex-col items-center gap-4 p-6 text-center">
          <div className="relative">
            <ProgressRing
              value={TIER_PROGRESS}
              label={t("rewards.balance")}
              size={148}
              stroke={12}
              className="text-[var(--brand)]"
            />
            <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <AnimatedCounter value={REWARDS_BALANCE} className="text-3xl font-semibold tabular-nums" />
              <span className="mt-0.5 flex items-center gap-1 text-[0.75rem] text-[var(--muted-foreground)]">
                <Coins className="h-3.5 w-3.5 text-[var(--warning)]" aria-hidden="true" />
                {t("rewards.points")}
              </span>
            </span>
          </div>

          <div>
            <p className="text-sm font-medium">
              {PREV_TIER.name} → {NEXT_TIER.name}
            </p>
            <p className="mt-1 text-[0.75rem] text-[var(--muted-foreground)]">
              {Math.max(NEXT_TIER.threshold - REWARDS_BALANCE, 0)} {t("rewards.points")}
            </p>
          </div>

          <div className="w-full">
            <Progress value={TIER_PROGRESS} label={t("rewards.balance")} className="h-1.5" />
          </div>

          <ul className="w-full">
            {TIERS.map((tier) => {
              const unlocked = REWARDS_BALANCE >= tier.threshold;
              return (
                <li
                  key={tier.id}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] px-2.5 py-1.5 text-[0.75rem]"
                >
                  <span className={unlocked ? "font-medium" : "text-[var(--subtle-foreground)]"}>
                    {tier.name}
                  </span>
                  <span className="tabular-nums text-[var(--subtle-foreground)]">{tier.threshold}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Alert variant="info">{t("rewards.demoNote")}</Alert>

          <section aria-labelledby="rewards-benefits">
            <h2 id="rewards-benefits" className="mb-3 text-h4">
              {t("rewards.benefits")}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-3">
              {BENEFITS.map((benefit) => {
                const affordable = REWARDS_BALANCE >= benefit.cost;
                return (
                  <li key={benefit.key} className="surface-card flex flex-col gap-3 p-4">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--warning-soft)] text-[var(--warning)]"
                    >
                      <Gift className="h-[18px] w-[18px]" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{t(`rewards.${benefit.key}`)}</p>
                      <p className="mt-1 text-[0.75rem] tabular-nums text-[var(--muted-foreground)]">
                        {benefit.cost} {t("rewards.points")}
                      </p>
                    </div>
                    <Button
                      variant={affordable ? "primary" : "secondary"}
                      size="sm"
                      disabled={!affordable}
                      onClick={() => {
                        setRedeemedKey(benefit.key);
                        setAwarded(true);
                      }}
                    >
                      {affordable ? t("actions.select") : t("rewards.redeemed")}
                    </Button>
                  </li>
                );
              })}
            </ul>
            <p role="status" aria-live="polite" className="mt-2 min-h-[1.25rem] text-[0.8125rem] text-[var(--success)]">
              {redeemedKey ? `${t("rewards.redeemed")} — ${t(`rewards.${redeemedKey}`)}` : ""}
            </p>
          </section>

          <section aria-labelledby="rewards-history" className="surface-card p-5">
            <h2 id="rewards-history" className="flex items-center gap-2 text-h4">
              <History className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
              {t("rewards.history")}
            </h2>
            <ul className="mt-3 divide-y divide-[var(--divider)]">
              {DEMO_REWARDS.map((reward) => (
                <li key={reward.id} className="flex items-center gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{reward.label}</span>
                    <span className="block text-[0.75rem] text-[var(--subtle-foreground)]">
                      {reward.date}
                    </span>
                  </span>
                  <Badge variant="neutral">{t(`rewards.${reward.kind}`)}</Badge>
                  <span
                    className={cn(
                      "w-16 shrink-0 text-right text-sm font-medium tabular-nums",
                      KIND_TONE[reward.kind],
                    )}
                  >
                    {reward.kind === "redeemed" ? "−" : "+"}
                    {reward.points}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="rewards-rules" className="surface-card p-5">
            <h2 id="rewards-rules" className="text-h4">
              {t("rewards.rules")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {t("rewards.nonTransferable")}
            </p>
            <ul className="mt-3 space-y-1.5 text-[0.8125rem] text-[var(--muted-foreground)]">
              <li>· {t("rewards.rulesList.earn")}</li>
              <li>· {t("rewards.rulesList.noTrade")}</li>
              <li>· {t("rewards.rulesList.noValue")}</li>
              <li>· {t("rewards.rulesList.adjust")}</li>
            </ul>
          </section>

          <IntegrationPending feature={t("rewards.title")}>
            {t("common.phase1Note")}
          </IntegrationPending>

          <p className="flex items-start gap-2 text-[0.75rem] text-[var(--subtle-foreground)]">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {t("rewards.waysToEarn")}: {t("rewards.earnSubmitAchievement")}, {t("rewards.earnVerifyCredential")},{" "}
            {t("rewards.earnReferFriend")}.
          </p>
        </div>
      </div>
    </div>
  );
}
