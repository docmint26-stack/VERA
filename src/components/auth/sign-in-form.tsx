"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Separator, Kbd } from "@/components/ui/separator";
import { PasswordInput } from "./password-input";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.email("errors.email"),
  password: z.string().min(1, "errors.required"),
  remember: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function SignInForm() {
  const t = useT();
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [complete, setComplete] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);

    // Phase 1: no identity provider. Recognise the seeded demo account so the
    // happy path is walkable, reject anything else honestly.
    if (values.email.toLowerCase() === "demo@vera.app" && values.password === "Password123") {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setComplete(true);
      window.setTimeout(() => router.push("/app"), 650);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 550));
    setFormError(t("auth.errorInvalid"));
  };

  if (complete) {
    return (
      <div className="flex flex-col gap-4 py-6 text-center">
        <h1 className="text-h2">{t("auth.signInTitle")}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Taking you to your workspace…</p>
        <div className="mx-auto h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--brand-soft)] border-t-[var(--brand)]" />
        <Link href="/app" className={cn(buttonVariants({ variant: "link" }), "mx-auto")}>
          Continue to VERA
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t("auth.signInTitle")}</h1>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          {t("auth.signInSubtitle")}
        </p>
      </div>

      <Alert variant="warning" title={t("common.awaitingIntegration")}>
        {t("auth.pendingNotice")} Try{" "}
        <span className="font-mono text-[0.8125rem]">demo@vera.app</span> /{" "}
        <span className="font-mono text-[0.8125rem]">Password123</span>.
      </Alert>

      {formError && (
        <Alert variant="error" role="alert">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signin-email" required>
            {t("auth.email")}
          </FieldLabel>
          <Input
            id="signin-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "signin-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="signin-email-error">{errors.email?.message && t(errors.email.message)}</FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <FieldLabel htmlFor="signin-password" required>
              {t("auth.password")}
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="text-[0.8125rem] font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
          <PasswordInput
            id="signin-password"
            autoComplete="current-password"
            placeholder="••••••••••"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "signin-password-error" : undefined}
            {...register("password")}
          />
          <FieldError id="signin-password-error">
            {errors.password?.message && t(errors.password.message)}
          </FieldError>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted-foreground)]">
          <input
            type="checkbox"
            className="h-4 w-4 shrink-0 rounded-[4px] border border-[var(--border-strong)] accent-[var(--brand)] focus-ring"
            {...register("remember")}
          />
          {t("auth.rememberMe")}
        </label>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          {t("actions.signIn")}
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-[0.75rem] uppercase tracking-wider text-[var(--subtle-foreground)]">
          {t("auth.orContinueWith")}
        </span>
        <Separator className="flex-1" />
      </div>

      <Button
        variant="secondary"
        size="lg"
        className="w-full"
        onClick={() => setFormError(t("auth.pendingNotice"))}
        aria-describedby="google-pending"
      >
        <GoogleGlyph />
        {t("auth.continueWithGoogle")}
      </Button>
      <p id="google-pending" className="-mt-3 text-center text-[0.75rem] text-[var(--subtle-foreground)]">
        {t("common.awaitingIntegration")}
      </p>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {t("auth.noAccount")}{" "}
        <Link
          href="/signup"
          className="font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
        >
          {t("actions.signUp")}
        </Link>
      </p>

      <p className="text-center text-[0.75rem] leading-relaxed text-[var(--subtle-foreground)]">
        {t("auth.termsNotice")}
      </p>

      <p className="text-center text-[0.6875rem] text-[var(--subtle-foreground)]">
        Press <Kbd>Esc</Kbd> anywhere to close panels · <Kbd>Ctrl</Kbd>+<Kbd>K</Kbd> opens search
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 12.23c0-.7-.06-1.37-.18-2.02H12v3.82h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.99-4.3 2.99-7.32Z"
      />
      <path
        fill="currentColor"
        opacity="0.75"
        d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.23-2.5c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.08v2.58A10 10 0 0 0 12 22Z"
      />
      <path
        fill="currentColor"
        opacity="0.55"
        d="M6.41 13.91a6 6 0 0 1 0-3.82V7.51H3.08a10 10 0 0 0 0 8.98l3.33-2.58Z"
      />
      <path
        fill="currentColor"
        opacity="0.35"
        d="M12 5.97c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.08 7.51l3.33 2.58C7.2 7.73 9.4 5.97 12 5.97Z"
      />
    </svg>
  );
}
