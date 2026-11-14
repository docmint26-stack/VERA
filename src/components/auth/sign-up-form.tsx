"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { PasswordInput, PasswordRules, passwordMeetsRules } from "./password-input";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/api/auth-client";

const makeSchema = () =>
  z
    .object({
      name: z.string().min(2, "errors.nameShort"),
      email: z.email("errors.email"),
      password: z
        .string()
        .min(1, "errors.required")
        .refine((v) => passwordMeetsRules(v), "auth.errorWeakPassword"),
      confirm: z.string().min(1, "errors.required"),
      terms: z.boolean().refine((v) => v === true, { message: "errors.required" }),
    })
    .refine((data) => data.password === data.confirm, {
      message: "errors.passwordMatch",
      path: ["confirm"],
    });

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

export function SignUpForm() {
  const t = useT();
  const router = useRouter();
  const [formError, setFormError] = React.useState<string | null>(null);
  const [complete, setComplete] = React.useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(makeSchema()),
    defaultValues: { name: "", email: "", password: "", confirm: "", terms: false },
    mode: "onBlur",
  });

  const password = useWatch({ control, name: "password", defaultValue: "" });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    const result = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
      callbackURL: "/verify-email",
    });
    if (result.error) {
      setFormError(result.error.message || t("auth.errorEmailTaken"));
      return;
    }
    setComplete(true);
    router.replace("/verify-email");
  };

  if (complete) {
    return (
      <div className="flex flex-col gap-4 py-6 text-center">
        <h1 className="text-h2">{t("auth.verifyTitle")}</h1>
        <p className="text-sm text-[var(--muted-foreground)]">{t("auth.verifyBody")}</p>
        <div className="mx-auto h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--brand-soft)] border-t-[var(--brand)]" />
        <Link href="/verify-email" className={cn(buttonVariants({ variant: "link" }), "mx-auto")}>
          Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1">{t("auth.signUpTitle")}</h1>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          {t("auth.signUpSubtitle")}
        </p>
      </div>

      {formError && (
        <Alert variant="error" role="alert">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signup-name" required>
            {t("auth.fullName")}
          </FieldLabel>
          <Input
            id="signup-name"
            autoComplete="name"
            placeholder="Your name"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="signup-name-error">
            {errors.name?.message && t(errors.name.message)}
          </FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signup-email" required>
            {t("auth.email")}
          </FieldLabel>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "signup-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="signup-email-error">
            {errors.email?.message && t(errors.email.message)}
          </FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signup-password" required hint={`${password.length}`}>
            {t("auth.password")}
          </FieldLabel>
          <PasswordInput
            id="signup-password"
            autoComplete="new-password"
            placeholder="••••••••••"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby="signup-password-rules"
            {...register("password")}
          />
          <FieldError id="signup-password-error">
            {errors.password?.message && t(errors.password.message)}
          </FieldError>
          <div id="signup-password-rules">
            <p className="text-[0.75rem] font-medium text-[var(--muted-foreground)]">
              {t("auth.passwordRequirements")}
            </p>
            <PasswordRules value={password} className="mt-1.5" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="signup-confirm" required>
            {t("auth.confirmPassword")}
          </FieldLabel>
          <PasswordInput
            id="signup-confirm"
            autoComplete="new-password"
            placeholder="••••••••••"
            aria-invalid={errors.confirm ? true : undefined}
            aria-describedby={errors.confirm ? "signup-confirm-error" : undefined}
            {...register("confirm")}
          />
          <FieldError id="signup-confirm-error">
            {errors.confirm?.message && t(errors.confirm.message)}
          </FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded-[4px] border border-[var(--border-strong)] accent-[var(--brand)] focus-ring"
              aria-invalid={errors.terms ? true : undefined}
              {...register("terms")}
            />
            <span>
              {t("auth.termsNotice")}{" "}
              <Link href="/terms" className="font-medium text-[var(--brand)] underline-offset-2 hover:underline">
                {t("nav.terms")}
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-[var(--brand)] underline-offset-2 hover:underline">
                {t("nav.privacy")}
              </Link>
              .
            </span>
          </label>
          <FieldError id="signup-terms-error">
            {errors.terms?.message && t(errors.terms.message)}
          </FieldError>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          {t("actions.signUp")}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        {t("auth.hasAccount")}{" "}
        <Link
          href="/signin"
          className="font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
        >
          {t("actions.signIn")}
        </Link>
      </p>
    </div>
  );
}
