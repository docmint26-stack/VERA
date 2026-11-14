import Link from "next/link";
import { VeraLogo } from "@/components/branding/vera-logo";
import { VeraMark } from "@/components/branding/vera-mark";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { SITE } from "@/lib/constants";

// Auth pages may read URL state (for example, an expiring reset token).
// Opt this segment out of instant prerendering under Cache Components.
export const instant = false;

/**
 * Split layout used by every authentication route: a branded panel that
 * explains where you are, and a focused form column with no site chrome.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      {/* Branded side */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-[var(--foreground)] p-10 text-[var(--background)] lg:flex">
        <div
          aria-hidden="true"
          className="grid-backdrop absolute inset-0 opacity-[0.18]"
          style={{
            // Override the light token so the grid reads on a dark panel.
            backgroundImage:
              "linear-gradient(to right, rgb(255 255 255 / 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.14) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 78% 68% at 50% 40%, #000 55%, transparent 100%)",
          }}
        />

        <Link href="/" className="relative inline-flex items-center gap-2.5 focus-ring rounded-sm">
          <VeraMark className="h-8 w-8" variant="inverse" />
          <span className="text-xl font-semibold tracking-[-0.04em]">VERA</span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-overline text-[var(--brand)]">{SITE.fullName}</p>
          <p className="mt-5 text-[2rem] font-semibold leading-[1.15] tracking-[-0.03em] text-balance">
            {SITE.tagline}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-[var(--background)]/70">
            {SITE.supportingTagline} Everything you create stays on this device until accounts and
            storage ship in Phase 2.
          </p>
        </div>

        <p className="relative text-[0.8125rem] text-[var(--background)]/55">
          © {SITE.copyrightYear} {SITE.name} · {SITE.url.replace(/^https?:\/\//, "")}
        </p>
      </aside>

      {/* Form side */}
      <div className="flex flex-col bg-[var(--background)]">
        <div className="flex items-center justify-between border-b border-[var(--divider)] px-5 py-4 sm:px-8">
          <Link href="/" className="lg:hidden focus-ring rounded-sm">
            <VeraLogo size="sm" />
          </Link>
          <Link href="/" className="hidden text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] focus-ring rounded-sm lg:inline">
            ← Back to site
          </Link>
          <div className="flex items-center gap-1.5">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <main id="main" className="flex flex-1 items-start justify-center px-5 py-10 sm:px-8 sm:py-14">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        <footer className="px-5 pb-6 text-center text-[0.75rem] text-[var(--subtle-foreground)] sm:px-8">
          <Link href="/privacy" className="hover:text-[var(--foreground)] focus-ring rounded-sm">
            Privacy
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href="/terms" className="hover:text-[var(--foreground)] focus-ring rounded-sm">
            Terms
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href="/faq" className="hover:text-[var(--foreground)] focus-ring rounded-sm">
            FAQ
          </Link>
        </footer>
      </div>
    </div>
  );
}
