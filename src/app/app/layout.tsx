import type { Metadata } from "next";
import { AppShell } from "@/components/app/app-shell";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";

export const metadata: Metadata = {
  title: { default: "Workspace", template: "%s · VERA" },
  description: "Your VERA workspace.",
  robots: { index: false, follow: false },
};

// This protected layout reads the request session before rendering. With
// Next.js 16 Cache Components, opt the authenticated subtree out of instant
// prerendering so private session data cannot be forced through a static shell.
export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/signin?callbackURL=/app");
  return <AppShell>{children}</AppShell>;
}
