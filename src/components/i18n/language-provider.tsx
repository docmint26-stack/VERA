"use client";

import * as React from "react";
import { readStorage, writeStorage, isBrowser } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocale,
  translate,
  type Dictionary,
  type Locale,
} from "@/i18n";
import { getDictionary } from "@/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (value: Locale) => void;
  /** False until the persisted preference has been read from storage. */
  hydrated: boolean;
}

const LanguageContext = React.createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  hydrated: false,
});

export function useLanguage() {
  return React.useContext(LanguageContext);
}

/**
 * Binds the active locale to the document so `lang` and `data-locale` always
 * match the rendered copy — important for screen readers, hyphenation and
 * locale-specific styling.
 */
function applyToDocument(locale: Locale) {
  if (!isBrowser()) return;
  const root = document.documentElement;
  root.lang = locale;
  root.dataset.locale = locale;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    const stored = readStorage(STORAGE_KEYS.locale);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  });

  React.useEffect(() => {
    applyToDocument(locale);
  }, [locale]);

  const setLocale = React.useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    applyToDocument(next);
    writeStorage(STORAGE_KEYS.locale, next);
  }, []);

  const dictionary: Dictionary = React.useMemo(() => getDictionary(locale), [locale]);

  const translateBound = React.useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, hydrated: true }}>
      <DictionaryContext.Provider value={{ dictionary, t: translateBound }}>
        {children}
      </DictionaryContext.Provider>
    </LanguageContext.Provider>
  );
}

interface DictionaryContextValue {
  dictionary: Dictionary;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const DictionaryContext = React.createContext<DictionaryContextValue>({
  dictionary: getDictionary(DEFAULT_LOCALE),
  t: (key) => translate(DEFAULT_LOCALE, key),
});

/** Translate a dotted key using the active locale. */
export function useT() {
  return React.useContext(DictionaryContext).t;
}

/** Full merged dictionary for the active locale (typed). */
export function useDictionary() {
  return React.useContext(DictionaryContext).dictionary;
}

export { LOCALES, type Locale };
