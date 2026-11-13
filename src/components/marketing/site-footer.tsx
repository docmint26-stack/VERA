"use client";

import * as React from "react";
import Link from "next/link";
import { VeraLogo } from "@/components/branding/vera-logo";
import { useT } from "@/components/i18n/language-provider";
import { SITE } from "@/lib/constants";

interface FooterColumn {
  titleKey: string;
  links: { labelKey: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    titleKey: "nav.product",
    links: [
      { labelKey: "nav.ai", href: "/features#ai" },
      { labelKey: "nav.documents", href: "/features#documents" },
      { labelKey: "nav.vault", href: "/features#vault" },
      { labelKey: "nav.passport", href: "/features#passport" },
      { labelKey: "nav.verification", href: "/features#verification" },
      { labelKey: "nav.rewards", href: "/features#rewards" },
    ],
  },
  {
    titleKey: "nav.solutions",
    links: [
      { labelKey: "nav.about", href: "/solutions" },
      { labelKey: "nav.howItWorks", href: "/how-it-works" },
      { labelKey: "nav.trust", href: "/trust" },
      { labelKey: "nav.features", href: "/features" },
    ],
  },
  {
    titleKey: "nav.resources",
    links: [
      { labelKey: "help.gettingStarted", href: "/resources" },
      { labelKey: "nav.faq", href: "/faq" },
      { labelKey: "nav.contact", href: "/contact" },
      { labelKey: "help.tutorials", href: "/resources" },
    ],
  },
  {
    titleKey: "nav.account",
    links: [
      { labelKey: "nav.signIn", href: "/signin" },
      { labelKey: "actions.signUp", href: "/signup" },
      { labelKey: "nav.help", href: "/help" },
      { labelKey: "nav.faq", href: "/faq" },
    ],
  },
];

export function SiteFooter() {
  const t = useT();
  const year = SITE.copyrightYear;

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div className="max-w-xs">
            <VeraLogo size="md" />
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              {t("brand.tagline")}
            </p>
            <p className="mt-3 text-caption">{t("brand.fullName")}</p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.titleKey} aria-label={t(column.titleKey)}>
              <h2 className="text-[0.8125rem] font-semibold uppercase tracking-wider text-[var(--foreground)]">
                {t(column.titleKey)}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link, index) => (
                  <li key={`${link.href}-${index}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted-foreground)] transition-colors duration-150 hover:text-[var(--foreground)] focus-ring rounded-sm"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[var(--divider)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption">
            © {year} {SITE.name}. {t("brand.fullName")}.
          </p>
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <li>
              <Link href="/privacy" className="text-caption hover:text-[var(--foreground)] focus-ring rounded-sm">
                {t("nav.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-caption hover:text-[var(--foreground)] focus-ring rounded-sm">
                {t("nav.terms")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-caption hover:text-[var(--foreground)] focus-ring rounded-sm">
                {t("nav.contact")}
              </Link>
            </li>
          </ul>
        </div>

        <p className="mt-6 max-w-3xl text-[0.75rem] leading-relaxed text-[var(--subtle-foreground)]">
          {t("common.phase1Note")}
        </p>
      </div>
    </footer>
  );
}
