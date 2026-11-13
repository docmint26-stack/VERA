"use client";

import { useT } from "@/components/i18n/language-provider";

/**
 * Renders a translated string inside an otherwise server-rendered page.
 *
 * Marketing body copy is authored in English for SEO; this lets server pages
 * still emit localised navigation labels and primary actions.
 */
export function T({
  k,
  vars,
}: {
  k: string;
  vars?: Record<string, string | number>;
}) {
  const t = useT();
  return <>{t(k, vars)}</>;
}
