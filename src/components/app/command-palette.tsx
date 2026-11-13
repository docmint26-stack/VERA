"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, MessageSquare, Search, Settings, Moon, Languages, FolderLock, BadgeCheck } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useT, useLanguage } from "@/components/i18n/language-provider";
import { useTheme } from "next-themes";
import { WORKSPACE_NAV, UTILITY_NAV } from "./nav-config";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  section: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  run?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { locale, setLocale } = useLanguage();
  const [query, setQuery] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commands = React.useMemo<Command[]>(() => {
    const navigate: Command[] = [...WORKSPACE_NAV, ...UTILITY_NAV].map((item) => ({
      id: `nav-${item.href}`,
      label: t(item.labelKey),
      section: t("command.sectionNavigate"),
      href: item.href,
      icon: item.icon,
    }));

    const create: Command[] = [
      {
        id: "create-document",
        label: t("command.createDocument"),
        section: t("command.sectionCreate"),
        href: "/app/documents",
        icon: FilePlus2,
      },
      {
        id: "open-ai",
        label: t("command.openAi"),
        section: t("command.sectionCreate"),
        href: "/app/ai",
        icon: MessageSquare,
      },
      {
        id: "open-vault",
        label: t("command.openVault"),
        section: t("command.sectionNavigate"),
        href: "/app/vault",
        icon: FolderLock,
      },
      {
        id: "open-passport",
        label: t("command.openPassport"),
        section: t("command.sectionNavigate"),
        href: "/app/passport",
        icon: BadgeCheck,
      },
    ];

    const actions: Command[] = [
      {
        id: "toggle-theme",
        label: t("command.toggleTheme"),
        section: t("command.sectionActions"),
        icon: Moon,
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
      {
        id: "toggle-language",
        label: t("command.toggleLanguage"),
        section: t("command.sectionActions"),
        icon: Languages,
        run: () => setLocale(locale === "en" ? "bn" : "en"),
      },
      {
        id: "open-settings",
        label: t("command.openSettings"),
        section: t("command.sectionActions"),
        href: "/app/settings",
        icon: Settings,
      },
    ];

    return [...navigate, ...create, ...actions];
  }, [t, setTheme, theme, locale, setLocale]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (command) =>
        command.label.toLowerCase().includes(q) ||
        command.section.toLowerCase().includes(q),
    );
  }, [commands, query]);

  const runCommand = (command: Command) => {
    onOpenChange(false);
    if (command.run) command.run();
    else if (command.href) router.push(command.href);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex((i) => (filtered.length === 0 ? 0 : (i + 1) % filtered.length));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex((i) => (filtered.length === 0 ? 0 : (i - 1 + filtered.length) % filtered.length));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const command = filtered[index];
      if (command) runCommand(command);
    }
  };

  let lastSection = "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="top-[12vh] translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">{t("command.title")}</DialogTitle>

        <div className="flex items-center gap-3 border-b border-[var(--divider)] px-4">
          <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-listbox"
            aria-activedescendant={filtered[index] ? `command-${filtered[index].id}` : undefined}
            aria-autocomplete="list"
            aria-label={t("command.placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("command.placeholder")}
            className="h-14 w-full bg-transparent text-sm outline-none placeholder:text-[var(--subtle-foreground)]"
          />
          <kbd className="shrink-0 rounded border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[0.625rem] text-[var(--subtle-foreground)]">
            Esc
          </kbd>
        </div>

        <div
          id="command-listbox"
          role="listbox"
          aria-label={t("command.title")}
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
              {t("command.noResults")}
            </p>
          ) : (
            filtered.map((command, i) => {
              const showSection = command.section !== lastSection;
              lastSection = command.section;
              return (
                <React.Fragment key={command.id}>
                  {showSection && (
                    <p className="px-3 pb-1 pt-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-[var(--subtle-foreground)]">
                      {command.section}
                    </p>
                  )}
                  <button
                    type="button"
                    id={`command-${command.id}`}
                    role="option"
                    aria-selected={i === index}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => runCommand(command)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-sm transition-colors focus:outline-none",
                      i === index ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--foreground)]",
                    )}
                  >
                    <command.icon className="h-4 w-4 shrink-0" aria-hidden={true} />
                    <span className="truncate">{command.label}</span>
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--divider)] bg-[var(--surface)] px-4 py-2 text-[0.6875rem] text-[var(--subtle-foreground)]">
          <span>↑↓ {t("command.hintNavigate")}</span>
          <span>↵ {t("command.hintSelect")}</span>
          <span>Esc {t("command.hintClose")}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Global ⌘K / Ctrl+K listener shared by the shell and dashboard. */
export function useCommandPaletteShortcut(onOpen: () => void) {
  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onOpen]);
}
