"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FolderKanban,
  BadgeCheck,
  Compass,
  Briefcase,
  GraduationCap,
  Check,
  Rocket,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/ui/label";
import { Progress } from "@/components/ui/popover";
import { VeraLogo } from "@/components/branding/vera-logo";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { useT, useLanguage } from "@/components/i18n/language-provider";
import { readStorage, writeStorage, cn } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";
import { LOCALE_NAMES, LOCALES, type Locale } from "@/i18n";

type GoalId =
  | "documents"
  | "organize"
  | "showcase"
  | "verify"
  | "opportunities"
  | "professional";

interface Draft {
  step: number;
  goal: GoalId | null;
  name: string;
  role: string;
  locale: Locale;
}

const STEPS = ["welcome", "goal", "profile", "personalize", "tour"] as const;
const LAST_STEP = STEPS.length - 1;

const GOALS: { id: GoalId; icon: typeof Sparkles; labelKey: string }[] = [
  { id: "documents", icon: Sparkles, labelKey: "onboarding.goalDocuments" },
  { id: "organize", icon: FolderKanban, labelKey: "onboarding.goalOrganize" },
  { id: "showcase", icon: BadgeCheck, labelKey: "onboarding.goalShowcase" },
  { id: "verify", icon: Compass, labelKey: "onboarding.goalVerify" },
  { id: "opportunities", icon: Briefcase, labelKey: "onboarding.goalOpportunities" },
  { id: "professional", icon: GraduationCap, labelKey: "onboarding.goalProfessional" },
];

const SUGGESTIONS: Record<GoalId, { titleKey: string; bodyKey: string }[]> = {
  documents: [
    { titleKey: "documents.newDocument", bodyKey: "documents.subtitle" },
    { titleKey: "ai.emptyTitle", bodyKey: "ai.emptyBody" },
    { titleKey: "dashboard.checklistProfile", bodyKey: "onboarding.profileSubtitle" },
  ],
  organize: [
    { titleKey: "vault.newFolder", bodyKey: "vault.subtitle" },
    { titleKey: "vault.uploadFiles", bodyKey: "vault.localNote" },
    { titleKey: "documents.newDocument", bodyKey: "documents.subtitle" },
  ],
  showcase: [
    { titleKey: "passport.editProfile", bodyKey: "passport.subtitle" },
    { titleKey: "achievements.submit", bodyKey: "achievements.subtitle" },
    { titleKey: "achievements.stepEvidence", bodyKey: "achievements.evidenceBody" },
  ],
  verify: [
    { titleKey: "achievements.submit", bodyKey: "achievements.subtitle" },
    { titleKey: "verification.journey", bodyKey: "verification.subtitle" },
    { titleKey: "verification.publicTitle", bodyKey: "verification.publicBody" },
  ],
  opportunities: [
    { titleKey: "opportunities.search", bodyKey: "opportunities.subtitle" },
    { titleKey: "opportunities.save", bodyKey: "opportunities.suggested" },
    { titleKey: "achievements.submit", bodyKey: "achievements.subtitle" },
  ],
  professional: [
    { titleKey: "passport.editProfile", bodyKey: "passport.subtitle" },
    { titleKey: "documents.newDocument", bodyKey: "documents.subtitle" },
    { titleKey: "verification.journey", bodyKey: "verification.subtitle" },
  ],
};

const TOUR = [
  { titleKey: "onboarding.tourSidebar", icon: FolderKanban },
  { titleKey: "onboarding.tourAsk", icon: Sparkles },
  { titleKey: "onboarding.tourCommand", icon: Rocket },
] as const;

export function OnboardingWizard() {
  const t = useT();
  const { locale, setLocale } = useLanguage();
  const router = useRouter();

  const storedDraft: Partial<Draft> = (() => {
    try {
      const raw = readStorage(STORAGE_KEYS.onboarding);
      if (raw) return JSON.parse(raw) as Partial<Draft>;
    } catch {
      /* ignore malformed drafts */
    }
    return {};
  })();

  const [step, setStep] = React.useState(() => Math.min(storedDraft.step ?? 0, LAST_STEP));
  const [goal, setGoal] = React.useState<GoalId | null>(storedDraft.goal ?? null);
  const [name, setName] = React.useState(storedDraft.name ?? "");
  const [role, setRole] = React.useState(storedDraft.role ?? "");
  const [nameError, setNameError] = React.useState<string | null>(null);

  // Persist after hydration so we never clobber a stored draft on first paint.
  React.useEffect(() => {
    const draft: Draft = { step, goal, name, role, locale };
    writeStorage(STORAGE_KEYS.onboarding, JSON.stringify(draft));
  }, [step, goal, name, role, locale]);

  const go = (next: number) => {
    setNameError(null);
    setStep(Math.max(0, Math.min(next, LAST_STEP)));
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const handleContinue = () => {
    if (step === 2) {
      if (name.trim().length < 2) {
        setNameError(t("errors.nameShort"));
        return;
      }
    }
    if (step === LAST_STEP) {
      writeStorage(STORAGE_KEYS.onboardingComplete, "1");
      router.push("/app");
      return;
    }
    go(step + 1);
  };

  const progress = ((step + 1) / (LAST_STEP + 1)) * 100;

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between gap-4 px-5">
          <VeraLogo size="sm" href="/app" />
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher />
            <ThemeToggle />
            <Link
              href="/app"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-1")}
              onClick={() => writeStorage(STORAGE_KEYS.onboardingComplete, "1")}
            >
              {t("actions.skip")}
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="flex flex-1 items-start justify-center px-5 py-8 sm:py-12">
        <div className="w-full max-w-2xl">
          <div className="mb-8 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[0.8125rem] text-[var(--muted-foreground)]">
              <span>
                {t("common.step")} {step + 1} {t("common.of")} {LAST_STEP + 1}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} label={t("onboarding.progressLabel")} className="h-1.5" />
          </div>

          <div className="surface-card p-6 sm:p-8">
            <StepContent
              step={step}
              goal={goal}
              setGoal={setGoal}
              name={name}
              setName={setName}
              role={role}
              setRole={setRole}
              nameError={nameError}
              locale={locale}
              setLocale={setLocale}
            />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => go(step - 1)}
              disabled={step === 0}
              aria-label={t("actions.previous")}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("actions.back")}
            </Button>

            <Button variant="primary" size="lg" onClick={handleContinue}>
              {step === LAST_STEP ? t("onboarding.tourDone") : t("actions.next")}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {step !== LAST_STEP && (
            <p className="mt-4 text-center text-[0.8125rem] text-[var(--subtle-foreground)]">
              {t("onboarding.skipNote")}{" "}
              <button
                type="button"
                onClick={() => {
                  writeStorage(STORAGE_KEYS.onboardingComplete, "1");
                  router.push("/app");
                }}
                className="font-medium text-[var(--brand)] underline-offset-2 hover:underline focus-ring rounded-sm"
              >
                {t("actions.skip")}
              </button>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function StepContent(props: {
  step: number;
  goal: GoalId | null;
  setGoal: (g: GoalId) => void;
  name: string;
  setName: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  nameError: string | null;
  locale: Locale;
  setLocale: (l: Locale) => void;
}) {
  const t = useT();
  const { step, goal } = props;

  if (step === 0) {
    return (
      <div className="flex flex-col gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
          <Rocket className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-h1 text-balance">{t("onboarding.welcomeTitle")}</h1>
        <p className="text-lead">{t("onboarding.welcomeBody")}</p>
        <ul className="mt-2 space-y-2.5">
          {[
            "Everything stays on this device",
            "Two minutes, five short steps",
            "Change anything later in Settings",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--muted-foreground)]">
              <Check className="h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 text-balance">{t("onboarding.goalTitle")}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{t("onboarding.goalSubtitle")}</p>
        </div>

        <fieldset>
          <legend className="sr-only">{t("onboarding.goalTitle")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {GOALS.map((option) => {
              const active = goal === option.id;
              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border p-4 transition-all duration-150 focus-within:ring-4 focus-within:ring-[var(--brand-ring)]",
                    active
                      ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]",
                  )}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={option.id}
                    checked={active}
                    onChange={() => props.setGoal(option.id)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]",
                      active ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-elevated)] text-[var(--muted-foreground)]",
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium leading-snug">{t(option.labelKey)}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 text-balance">{t("onboarding.profileTitle")}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{t("onboarding.profileSubtitle")}</p>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="ob-name" required>
            {t("onboarding.profileName")}
          </FieldLabel>
          <Input
            id="ob-name"
            autoComplete="name"
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            aria-invalid={props.nameError ? true : undefined}
            aria-describedby={props.nameError ? "ob-name-error" : undefined}
            placeholder="Your name"
          />
          <FieldError id="ob-name-error">{props.nameError}</FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="ob-language">{t("onboarding.profileLanguage")}</FieldLabel>
          <select
            id="ob-language"
            value={props.locale}
            onChange={(e) => props.setLocale(e.target.value as Locale)}
            className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 text-sm shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)]"
          >
            {LOCALES.map((code) => (
              <option key={code} value={code}>
                {LOCALE_NAMES[code]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="ob-role" hint={t("common.optional")}>
            {t("onboarding.profileRole")}
          </FieldLabel>
          <Input
            id="ob-role"
            value={props.role}
            onChange={(e) => props.setRole(e.target.value)}
            placeholder="e.g. Product designer"
          />
        </div>
      </div>
    );
  }

  if (step === 3) {
    const suggestions = goal ? SUGGESTIONS[goal] : SUGGESTIONS.documents;
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-h2 text-balance">{t("onboarding.personalizeTitle")}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{t("onboarding.personalizeBody")}</p>
        </div>
        <ol className="space-y-3">
          {suggestions.map((item, index) => (
            <li
              key={item.titleKey + index}
              className="flex gap-3.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-[0.75rem] font-semibold text-white">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold">{t(item.titleKey)}</span>
                <span className="mt-1 block text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {t(item.bodyKey)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="text-h2 text-balance">{t("onboarding.tourTitle")}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{t("onboarding.tourBody")}</p>
      </div>
      <ul className="space-y-3">
        {TOUR.map((item, index) => (
          <li
            key={item.titleKey}
            className="flex items-start gap-3.5 rounded-[var(--radius-sm)] border border-[var(--border)] p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
              <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold">{t(item.titleKey)}</span>
              <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                {index === 2 ? "⌘K / Ctrl+K" : t("nav.workspace")}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="rounded-[var(--radius-sm)] bg-[var(--brand-soft)] px-4 py-3 text-sm text-[var(--brand)]">
        {t("common.phase1Note")}
      </p>
    </div>
  );
}
