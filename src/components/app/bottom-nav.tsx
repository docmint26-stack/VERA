"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { useT } from "@/components/i18n/language-provider";
import { WORKSPACE_NAV, isActivePath } from "./nav-config";
import { cn } from "@/lib/utils";

/** Fixed bottom navigation for phones. Four primaries plus an overflow sheet. */
export function BottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  const t = useT();
  const pathname = usePathname();
  const items = WORKSPACE_NAV.filter((item) => item.primary);

  return (
    <nav
      aria-label={t("nav.menu")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md lg:hidden safe-bottom"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-[62px] flex-col items-center justify-center gap-1 px-1 text-[0.625rem] font-medium transition-colors focus-ring",
                  active ? "text-[var(--brand)]" : "text-[var(--muted-foreground)]",
                )}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex h-[62px] w-full flex-col items-center justify-center gap-1 px-1 text-[0.625rem] font-medium text-[var(--muted-foreground)] transition-colors focus-ring"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            <span>{t("nav.menu")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
