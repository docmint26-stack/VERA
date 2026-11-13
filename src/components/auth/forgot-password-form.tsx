"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldLabel, FieldError } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SuccessCheckmark } from "@/components/motion/success-checkmark";
import { useT } from "@/components/i18n/language-provider";

const schema = z.object({ email: z.email("errors.email") });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const t = useT();
  const [sent, setSent] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <SuccessCheckmark />
        <h1 className="text-h2">{t("auth.resetSent")}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
          {t("auth.resetSentBody")}
        </p>
        <Alert variant="info" className="max-w-sm text-left">
          {t("auth.pendingNotice")}
        </Alert>
        <Link href="/signin" className="text-sm font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm">
          ← {t("actions.back")} to {t("actions.signIn")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
          <MailCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="text-h1">{t("auth.resetPassword")}</h1>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          {t("auth.resetSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="forgot-email" required>
            {t("auth.email")}
          </FieldLabel>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "forgot-email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="forgot-email-error">
            {errors.email?.message && t(errors.email.message)}
          </FieldError>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
          {t("auth.resetPassword")}
        </Button>
      </form>

      <Link
        href="/signin"
        className="text-center text-sm font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
      >
        ← {t("actions.back")} to {t("actions.signIn")}
      </Link>
    </div>
  );
}
