import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a VERA account and set up your workspace.",
  robots: { index: false },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
