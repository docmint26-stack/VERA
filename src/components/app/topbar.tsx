"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Check,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
  LifeBuoy,
  ChevronsUpDown,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/popover";
import { VeraLogo } from "@/components/branding/vera-logo";
import { useT } from "@/components/i18n/language-provider";
import { WORKSPACE_NAV, UTILITY_NAV, isActivePath } from "./nav-config";
import { ThemeToggle } from "@/components/marketing/theme-toggle";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { cn } from "@/lib/utils";

const NOTIFICATIONS = [
  { id: "n1", title: "Welcome to VERA", body: "Your workspace is ready. Start with the dashboard checklist.", time: "now", unread: true },
  { id: "n2", title: "Phase 1 preview", body: "Services are not connected yet — everything runs locally.", time: "1m", unread: true },
  { id: "n3", title: "Try the command palette", body: "Press Ctrl or ⌘ + K to jump anywhere.", time: "2m", unread: false },
] as const;

export function Topbar({
  onOpenCommand,
  onOpenMenu,
  menuOpen,
}: {
  onOpenCommand: () => void;
  onOpenMenu: () => void;
  menuOpen: boolean;
}) {
  const t = useT();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [read, setRead] = React.useState<Record<string, boolean>>({});

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread && !read[n.id]).length;

  const nav = [...WORKSPACE_NAV, ...UTILITY_NAV];

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md safe-top">
      <div className="flex h-16 items-center gap-2 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label={t("nav.openMenu")}
          aria-expanded={menuOpen}
          onClick={onOpenMenu}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>

        <Link href="/app" className="lg:hidden" aria-label={t("nav.home")}>
          <VeraLogo size="sm" href={null} />
        </Link>

        <div className="hidden min-w-0 lg:block">
          <Breadcrumb pathname={pathname} />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenCommand}
            className="hidden h-9 w-56 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-left text-sm text-[var(--subtle-foreground)] transition-colors hover:border-[var(--border-strong)] focus-ring md:flex"
            aria-label={t("command.title")}
          >
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{t("actions.search")}…</span>
            <kbd className="ml-auto rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 font-mono text-[0.625rem]">
              ⌘K
            </kbd>
          </button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-label={t("command.title")}
            onClick={onOpenCommand}
          >
            <Search className="h-[18px] w-[18px]" aria-hidden="true" />
          </Button>

          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t("nav.notifications")}>
                <span className="relative">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span
                      className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--error)] px-0.5 text-[0.5rem] font-bold leading-none text-white"
                      aria-hidden="true"
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(92vw,360px)] p-0">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>{t("nav.notifications")}</span>
                <button
                  type="button"
                  onClick={() => setRead(Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, true])))}
                  className="text-[0.75rem] font-medium text-[var(--brand)] hover:underline"
                >
                  {t("common.all")}
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <ul className="max-h-[320px] overflow-y-auto p-1.5">
                {NOTIFICATIONS.map((item) => {
                  const isRead = read[item.id];
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setRead((r) => ({ ...r, [item.id]: true }))}
                        className={cn(
                          "flex w-full flex-col gap-0.5 rounded-[6px] px-3 py-2.5 text-left transition-colors hover:bg-[var(--surface-elevated)] focus:bg-[var(--surface-elevated)] focus:outline-none",
                          isRead && "opacity-60",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          {!isRead && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand)]" aria-hidden="true" />
                          )}
                          <span className="text-sm font-medium">{item.title}</span>
                          <span className="ml-auto shrink-0 text-[0.6875rem] text-[var(--subtle-foreground)]">
                            {item.time}
                          </span>
                        </span>
                        <span className="text-[0.8125rem] leading-snug text-[var(--muted-foreground)]">
                          {item.body}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <DropdownMenuSeparator />
              <p className="px-3 py-2.5 text-[0.6875rem] text-[var(--subtle-foreground)]">
                {t("common.demoData")} · {t("common.awaitingIntegration")}
              </p>
            </DropdownMenuContent>
          </DropdownMenu>

          <LocaleSwitcher className="hidden sm:inline-flex" />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t("nav.account")}
                className="flex items-center gap-1.5 rounded-full focus-ring ml-1"
              >
                <UserAvatar name="Ayaan Rahman" className="h-8 w-8" />
                <ChevronsUpDown className="hidden h-3.5 w-3.5 text-[var(--muted-foreground)] sm:block" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block text-sm font-semibold">Ayaan Rahman</span>
                <span className="block truncate text-[0.75rem] font-normal text-[var(--muted-foreground)]">
                  demo@vera.app
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/passport">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  {t("nav.profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/settings">
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  {t("nav.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/help">
                  <LifeBuoy className="h-4 w-4" aria-hidden="true" />
                  {t("nav.help")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/signin">
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {t("actions.signOut")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile navigation */}
      <Sheet open={menuOpen} onOpenChange={(v) => { if (!v) onOpenMenu(); }} side="left" title={t("nav.menu")}>
        <nav aria-label={t("nav.menu")} className="px-3 py-4">
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium focus-ring",
                      active
                        ? "bg-[var(--brand-soft)] text-[var(--brand)]"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t(item.labelKey)}
                    {active && <Check className="ml-auto h-3.5 w-3.5" aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 border-t border-[var(--divider)] pt-4">
            <Link href="/signin" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full")}>
              {t("actions.signOut")}
            </Link>
          </div>
        </nav>
      </Sheet>
    </header>
  );
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const t = useT();
  const current = [...WORKSPACE_NAV, ...UTILITY_NAV].find((item) => isActivePath(pathname, item.href));
  const label = current ? t(current.labelKey) : t("nav.workspace");

  return (
    <nav aria-label={t("nav.breadcrumb")} className="flex items-center gap-2 text-sm">
      <span className="text-[var(--muted-foreground)]">{t("nav.workspace")}</span>
      <span aria-hidden="true" className="text-[var(--subtle-foreground)]">
        /
      </span>
      <span className="font-medium">{label}</span>
    </nav>
  );
}
