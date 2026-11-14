import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default function ResetPasswordPage() {
  return <Suspense fallback={<div className="h-64" aria-busy="true" />}><ResetPasswordForm /></Suspense>;
}
