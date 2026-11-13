"use client";

import * as React from "react";
import { Check, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/components/i18n/language-provider";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/i18n";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label={`Language: ${LOCALE_NAMES[locale]}`}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{LOCALE_NAMES[locale]}</span>
          <span className="sm:hidden">{locale.toUpperCase()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-1">
        <ul role="menu" aria-label="Choose language">
          {LOCALES.map((code: Locale) => {
            const active = code === locale;
            return (
              <li key={code}>
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-[6px] px-2.5 py-2 text-left text-sm transition-colors hover:bg-[var(--surface-elevated)] focus:bg-[var(--surface-elevated)] focus:outline-none"
                >
                  {LOCALE_NAMES[code]}
                  {active && <Check className="h-3.5 w-3.5 text-[var(--brand)]" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
