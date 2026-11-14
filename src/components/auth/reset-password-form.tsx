"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { FieldLabel, FieldError } from "@/components/ui/label";
import { PasswordInput, passwordMeetsRules } from "./password-input";
import { useT } from "@/components/i18n/language-provider";
import { authClient } from "@/lib/api/auth-client";

const schema = z.object({
  password: z.string().refine(passwordMeetsRules, "auth.errorWeakPassword"),
  confirm: z.string(),
}).refine((value) => value.password === value.confirm, { path: ["confirm"], message: "errors.passwordMatch" });
type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError(null);
    const token = params.get("token");
    if (!token) { setError("This password reset link is missing or invalid."); return; }
    const result = await authClient.resetPassword({ newPassword: values.password, token });
    if (result.error) { setError(result.error.message || "The reset link is invalid or expired."); return; }
    router.replace("/signin?reset=success");
  };

  return <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
    <div><h1 className="text-h1">Set a new password</h1><p className="mt-2 text-sm text-[var(--muted-foreground)]">Choose a strong password for your VERA account.</p></div>
    {error && <Alert variant="error" role="alert">{error}</Alert>}
    <div className="flex flex-col gap-2"><FieldLabel htmlFor="reset-password" required>New password</FieldLabel><PasswordInput id="reset-password" autoComplete="new-password" {...register("password")} /><FieldError>{errors.password?.message && t(errors.password.message)}</FieldError></div>
    <div className="flex flex-col gap-2"><FieldLabel htmlFor="reset-confirm" required>Confirm password</FieldLabel><PasswordInput id="reset-confirm" autoComplete="new-password" {...register("confirm")} /><FieldError>{errors.confirm?.message && t(errors.confirm.message)}</FieldError></div>
    <Button type="submit" size="lg" loading={isSubmitting}>Update password</Button>
  </form>;
}
