import type { Metadata } from "next";
import { VerifyEmailPanel } from "@/components/auth/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Confirm your email address to activate your VERA account.",
  robots: { index: false },
};

export default function VerifyEmailPage() {
  return <VerifyEmailPanel />;
}
