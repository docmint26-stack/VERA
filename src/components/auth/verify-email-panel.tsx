"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, RotateCw, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "vera-pending-email";

export function VerifyEmailPanel() {
  const t = useT();
  const router = useRouter();
  const [email] = React.useState<string | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [resending, setResending] = React.useState(false);
  const [resentAt, setResentAt] = React.useState<number | null>(null);

  const resend = async () => {
    setResending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setResending(false);
    setResentAt(Date.now());
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
          <MailCheck className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-h1">{t("auth.verifyTitle")}</h1>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          {t("auth.verifyBody")}
        </p>
        {email && (
          <p className="surface-soft px-3.5 py-2.5 font-mono text-sm">{email}</p>
        )}
      </div>

      <Alert variant="warning" title={t("common.awaitingIntegration")}>
        {t("auth.pendingNotice")} No message was dispatched from this preview.
      </Alert>

      <div className="flex flex-col gap-3">
        <Button size="lg" loading={resending} onClick={resend} className="w-full">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          {t("auth.verifyResend")}
        </Button>
        {resentAt && (
          <p role="status" className="text-center text-[0.8125rem] text-[var(--success)]">
            Request recorded locally — nothing was sent.
          </p>
        )}

        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={() => router.push("/onboarding")}
        >
          {t("auth.verifyManual")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-4">
        <p className="text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
          In Phase 1 you can skip straight through: choose{" "}
          <strong className="font-semibold">{t("auth.verifyManual")}</strong> to continue to onboarding.
        </p>
      </div>

      <p className="text-center text-sm text-[var(--muted-foreground)]">
        Wrong address?{" "}
        <Link
          href="/signup"
          className={cn("font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm")}
        >
          {t("actions.signUp")}
        </Link>{" "}
        or{" "}
        <Link
          href="/signin"
          className="font-medium text-[var(--brand)] hover:underline focus-ring rounded-sm"
        >
          {t("actions.signIn")}
        </Link>
      </p>

      <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mx-auto")}>
        {t("nav.home")}
      </Link>
    </div>
  );
}
