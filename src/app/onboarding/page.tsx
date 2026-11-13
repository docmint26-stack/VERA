import type { Metadata } from "next";
import { OnboardingGuard } from "@/components/onboarding/onboarding-guard";

export const metadata: Metadata = {
  title: "Set up your workspace",
  description: "A short guided setup for your VERA workspace.",
  robots: { index: false },
};

export default function OnboardingPage() {
  return <OnboardingGuard />;
}
