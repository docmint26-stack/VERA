"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { VeraLogo } from "@/components/branding/vera-logo";
import { useT } from "@/components/i18n/language-provider";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

interface NavItem {
  labelKey: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "nav.product", href: "/features" },
  { labelKey: "nav.solutions", href: "/solutions" },
  { labelKey: "nav.howItWorks", href: "/how-it-works" },
  { labelKey: "nav.trust", href: "/trust" },
  { labelKey: "nav.resources", href: "/resources" },
];

export function SiteHeader() {
  const t = useT();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md shadow-[var(--shadow-xs)]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-[var(--radius-sm)] focus:bg-[var(--background)] focus:px-3 focus:py-2 focus:text-sm focus:shadow-[var(--shadow-md)]"
      >
        {t("nav.skipToContent")}
      </a>

      <div className="container-page flex h-16 items-center justify-between gap-4">
        <VeraLogo size="md" />

        <nav aria-label={t("nav.menu")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors duration-150 focus-ring",
                    isActive(item.href)
                      ? "text-[var(--foreground)] bg-[var(--surface)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]",
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <LocaleSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />
          <Link
            href="/signin"
            className={cn(
              buttonVariants({ variant: "ghost", size: "md" }),
              "hidden sm:inline-flex",
            )}
          >
            {t("nav.signIn")}
          </Link>
          <Link
            href="/signup"
            className={cn(buttonVariants({ variant: "primary", size: "md" }), "hidden sm:inline-flex")}
          >
            {t("nav.getStarted")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>

          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            aria-label={t("nav.openMenu")}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <Sheet
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        side="right"
        title={t("nav.menu")}
        description={t("nav.menu")}
        className="lg:hidden"
      >
        <nav aria-label={t("nav.menu")} className="px-4 pb-8 pt-4">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2.5 text-[0.9375rem] font-medium focus-ring",
                    isActive(item.href)
                      ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                      : "text-[var(--foreground)] hover:bg-[var(--surface)]",
                  )}
                >
                  {t(item.labelKey)}
                  <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2 border-t border-[var(--divider)] pt-6">
            <Link href="/signin" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full")}>
              {t("nav.signIn")}
            </Link>
            <Link href="/signup" className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}>
              {t("nav.getStarted")}
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--divider)] pt-4">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </nav>
      </Sheet>
    </header>
  );
}

export function SiteHeaderSpacer() {
  return <div aria-hidden="true" className="h-16" />;
}
