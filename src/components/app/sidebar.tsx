"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { VeraLogo } from "@/components/branding/vera-logo";
import { useT } from "@/components/i18n/language-provider";
import { readStorage, writeStorage, cn } from "@/lib/utils";
import { STORAGE_KEYS, LAYOUT } from "@/lib/constants";
import { WORKSPACE_NAV, UTILITY_NAV, isActivePath } from "./nav-config";

export function Sidebar() {
  const t = useT();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(() => readStorage(STORAGE_KEYS.sidebar) === "1");

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      writeStorage(STORAGE_KEYS.sidebar, next ? "1" : "0");
      return next;
    });
  };

  const isCollapsed = collapsed;

  return (
    <aside
      className={cn(
        "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-200 ease-[var(--ease-out)] lg:flex",
        isCollapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
      )}
      style={
        {
          "--sidebar-width": `${LAYOUT.sidebarWidth}px`,
          "--sidebar-collapsed": `${LAYOUT.sidebarCollapsed}px`,
        } as React.CSSProperties
      }
      aria-label={t("nav.menu")}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-3.5">
        {isCollapsed ? (
          <Link href="/app" aria-label={t("nav.home")} className="mx-auto focus-ring rounded-sm">
            <VeraLogo layout="icon" size="sm" href={null} />
          </Link>
        ) : (
          <VeraLogo size="sm" href="/app" />
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={isCollapsed ? t("nav.openMenu") : t("nav.closeMenu")}
          aria-expanded={!isCollapsed}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] focus-ring",
            isCollapsed && "mx-auto",
          )}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-2.5 pb-4" aria-label={t("nav.workspace")}>
        <NavList items={WORKSPACE_NAV} collapsed={isCollapsed} pathname={pathname} t={t} />

        <div className={cn("my-3 border-t border-[var(--divider)]", isCollapsed && "mx-1")} />

        <NavList items={UTILITY_NAV} collapsed={isCollapsed} pathname={pathname} t={t} />
      </nav>

      <div className="border-t border-[var(--divider)] p-3">
        <Link
          href="/app/ai"
          className={cn(
            "flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] p-2.5 text-left transition-colors hover:border-[var(--border-strong)] focus-ring",
            isCollapsed && "justify-center p-2",
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--brand)] text-white">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          {!isCollapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[0.8125rem] font-medium">{t("nav.ai")}</span>
              <span className="block truncate text-[0.6875rem] text-[var(--subtle-foreground)]">
                {t("common.awaitingIntegration")}
              </span>
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}

function NavList({
  items,
  collapsed,
  pathname,
  t,
}: {
  items: typeof WORKSPACE_NAV;
  collapsed: boolean;
  pathname: string;
  t: (key: string) => string;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? t(item.labelKey) : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-[0.8125rem] font-medium transition-colors duration-150 focus-ring",
                collapsed && "justify-center px-0",
                active
                  ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
              {collapsed && <span className="sr-only">{t(item.labelKey)}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
