"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { OnboardingWizard } from "./onboarding-wizard";
import { readStorage, isBrowser } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";

/**
 * Skips onboarding entirely when the flow has already been completed on this
 * device, so returning users land straight in the workspace.
 */
export function OnboardingGuard() {
  const router = useRouter();
  const [ready] = React.useState(() => {
    if (!isBrowser()) return false;
    return readStorage(STORAGE_KEYS.onboardingComplete) !== "1";
  });

  React.useEffect(() => {
    if (!ready && readStorage(STORAGE_KEYS.onboardingComplete) === "1") {
      router.replace("/app");
    }
  }, [ready, router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        <div
          aria-hidden="true"
          className="h-8 w-8 animate-spin-slow rounded-full border-2 border-[var(--brand-soft)] border-t-[var(--brand)]"
        />
      </div>
    );
  }

  return <OnboardingWizard />;
}
