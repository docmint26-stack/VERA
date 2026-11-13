import { en, type Dictionary } from "./en";
import { bn } from "./bn";

export type { Dictionary };

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  bn: "বাংলা",
};

export const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, DeepPartialDictionary> = {
  en,
  bn,
};

type DeepPartialDictionary = {
  [K in keyof Dictionary]?: Dictionary[K] extends object
    ? { [P in keyof Dictionary[K]]?: Dictionary[K][P] extends object ? unknown : Dictionary[K][P] }
    : Dictionary[K];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Resolves a dotted key such as "nav.features" against the locale dictionary,
 * falling back to English and finally to the key itself.
 */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const fallbackChain: Locale[] = locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE];

  for (const loc of fallbackChain) {
    let node: unknown = dictionaries[loc];
    const segments = key.split(".");
    for (const segment of segments) {
      if (!isRecord(node)) break;
      node = node[segment];
    }
    if (typeof node === "string" && node.length > 0) {
      return interpolate(node, vars);
    }
  }

  if (import.meta.env?.DEV) {
    console.warn(`[i18n] Missing translation key: ${key}`);
  }
  return key;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Merges the active locale over the English dictionary so consumers always
 * get a complete Dictionary-shaped object.
 */
export function getDictionary(locale: Locale): Dictionary {
  if (locale === DEFAULT_LOCALE) return en;
  return mergeDeep(en, dictionaries[locale]) as Dictionary;
}

function mergeDeep<T extends Record<string, unknown>>(base: T, patch: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const current = out[key];
    if (isRecord(value) && isRecord(current)) {
      out[key] = mergeDeep(current, value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as T;
}
