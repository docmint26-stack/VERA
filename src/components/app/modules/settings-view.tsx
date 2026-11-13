"use client";

import * as React from "react";
import { Bell, Monitor, Moon, Palette, Shield, Sun, User, Zap } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, IntegrationPending } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useLanguage, useT } from "@/components/i18n/language-provider";
import { LOCALES, LOCALE_NAMES } from "@/i18n";
import { useToast } from "@/components/motion/toast";
import { STORAGE_KEYS } from "@/lib/constants";

const MODES = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
] as const;

export function SettingsView() {
  const t = useT();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const { push } = useToast();
  const [saved, setSaved] = React.useState(false);
  const [profile, setProfile] = React.useState({
    name: "Ayaan Rahman",
    email: "demo@vera.app",
    headline: "Product designer",
    location: "Dhaka, BD",
  });
  const [toggles, setToggles] = React.useState({
    emailDigest: true,
    opportunityAlerts: true,
    verificationUpdates: true,
    marketing: false,
    reducedMotion: false,
  });

  const flip = (key: keyof typeof toggles) => (next: boolean) =>
    setToggles((state) => ({ ...state, [key]: next }));

  const saveProfile = () => {
    setSaved(true);
    push({ title: t("common.saved"), description: t("settings.profileNote"), variant: "success" });
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.subtitle")}
        actions={
          <>
            <Button variant="primary" onClick={saveProfile}>
              {saved ? t("common.saved") : t("actions.save")}
            </Button>
            <DemoBadge label={t("common.localOnly")} />
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card p-5" aria-labelledby="settings-profile">
          <h2 id="settings-profile" className="flex items-center gap-2 text-h4">
            <User className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            {t("settings.personal")}
          </h2>
          <div className="mt-4 grid gap-4">
            <Field id="set-name" label={t("common.name")}>
              <Input
                id="set-name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </Field>
            <Field id="set-email" label={t("auth.email")}>
              <Input
                id="set-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </Field>
            <Field id="set-headline" label={t("settings.headline")}>
              <Input
                id="set-headline"
                value={profile.headline}
                onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
              />
            </Field>
            <Field id="set-location" label={t("opportunities.location")}>
              <Input
                id="set-location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              />
            </Field>
            <p className="text-[0.75rem] text-[var(--subtle-foreground)]">
              {t("settings.profileNote")}
            </p>
          </div>
        </section>

        <section className="surface-card p-5" aria-labelledby="settings-appearance">
          <h2 id="settings-appearance" className="flex items-center gap-2 text-h4">
            <Palette className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            {t("settings.appearance")}
          </h2>

          <div className="mt-4">
            <p id="theme-label" className="text-[0.75rem] font-medium text-[var(--muted-foreground)]">
              {t("common.theme")}
            </p>
            <div role="radiogroup" aria-labelledby="theme-label" className="mt-2 grid grid-cols-3 gap-2">
              {MODES.map((mode) => {
                const active = theme === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTheme(mode.id)}
                    className={
                      "flex flex-col items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 py-3 text-[0.75rem] font-medium transition-colors focus-ring " +
                      (active
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]"
                        : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--border-strong)]")
                    }
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4">
            <div>
              <Label htmlFor="set-locale">{t("common.language")}</Label>
              <select
                id="set-locale"
                value={locale}
                onChange={(event) => setLocale(event.target.value as (typeof LOCALES)[number])}
                className="mt-1.5 h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)]"
              >
                {LOCALES.map((code) => (
                  <option key={code} value={code}>
                    {LOCALE_NAMES[code]}
                  </option>
                ))}
              </select>
            </div>

            <SettingRow
              id="set-motion"
              label={t("common.motionReduced")}
              description={t("settings.reducedMotionNote")}
              checked={toggles.reducedMotion}
              onChange={(next) => {
                flip("reducedMotion")(next);
                window.localStorage.setItem(STORAGE_KEYS.themeMotion, next ? "reduced" : "full");
              }}
            />
          </div>
        </section>

        <section className="surface-card p-5" aria-labelledby="settings-notifications">
          <h2 id="settings-notifications" className="flex items-center gap-2 text-h4">
            <Bell className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            {t("settings.notifications")}
          </h2>
          <div className="mt-4 grid gap-3.5">
            <SettingRow
              id="set-digest"
              label={t("settings.emailDigest")}
              description={t("settings.emailDigestNote")}
              checked={toggles.emailDigest}
              onChange={flip("emailDigest")}
            />
            <SettingRow
              id="set-opps"
              label={t("settings.opportunityAlerts")}
              description={t("settings.opportunityAlertsNote")}
              checked={toggles.opportunityAlerts}
              onChange={flip("opportunityAlerts")}
            />
            <SettingRow
              id="set-verify"
              label={t("settings.verificationUpdates")}
              description={t("settings.verificationUpdatesNote")}
              checked={toggles.verificationUpdates}
              onChange={flip("verificationUpdates")}
            />
            <SettingRow
              id="set-marketing"
              label={t("settings.marketingEmails")}
              description={t("settings.marketingEmailsNote")}
              checked={toggles.marketing}
              onChange={flip("marketing")}
            />
          </div>
        </section>

        <section className="surface-card p-5" aria-labelledby="settings-security">
          <h2 id="settings-security" className="flex items-center gap-2 text-h4">
            <Shield className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
            {t("settings.security")}
          </h2>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{t("settings.password")}</p>
                <p className="text-[0.75rem] text-[var(--muted-foreground)]">{t("settings.passwordNote")}</p>
              </div>
              <Button variant="secondary" size="sm">
                {t("settings.changePassword")}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{t("settings.twoFactor")}</p>
                <p className="text-[0.75rem] text-[var(--muted-foreground)]">{t("settings.twoFactorPending")}</p>
              </div>
              <Badge variant="brand">{t("common.awaitingIntegration")}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{t("settings.sessions")}</p>
                <p className="text-[0.75rem] text-[var(--muted-foreground)]">{t("settings.sessionsNote")}</p>
              </div>
              <Button variant="secondary" size="sm">
                {t("settings.signOutAll")}
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <IntegrationPending feature={t("settings.twoFactor")}>
              {t("settings.twoFactorPending")}
            </IntegrationPending>
          </div>
        </section>
      </div>

      <section className="rounded-[var(--radius-md)] border border-[var(--error)]/30 bg-[var(--error-soft)] p-5" aria-labelledby="settings-danger">
        <h2 id="settings-danger" className="flex items-center gap-2 text-h4 text-[var(--error)]">
          <Zap className="h-4 w-4" aria-hidden="true" />
          {t("settings.dangerZone")}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t("settings.deletePending")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="secondary">{t("settings.exportData")}</Button>
          <Button variant="danger">{t("settings.deleteAccount")}</Button>
        </div>
      </section>

      <Alert variant="info">{t("common.phase1Note")}</Alert>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function SettingRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="mt-0.5 text-[0.75rem] leading-relaxed text-[var(--muted-foreground)]">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
