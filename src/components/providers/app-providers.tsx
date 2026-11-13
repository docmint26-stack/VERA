"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionPreferenceProvider } from "@/components/motion/motion-pref";
import { ToastProvider } from "@/components/motion/toast";
import { LanguageProvider } from "@/components/i18n/language-provider";
import { ServiceWorkerProvider } from "./service-worker-provider";

/**
 * Single client entry point for every app-wide provider.
 *
 * Order matters:
 *   ThemeProvider   — sets `data-theme` before paint (injected script)
 *   LanguageProvider — sets `lang`/`data-locale` from persisted preference
 *   MotionPreferenceProvider — MotionConfig reducedMotion + `data-motion`
 *   ToastProvider   — must wrap anything that can raise a toast
 *   QueryClientProvider — shared React Query cache
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      storageKey="vera-theme"
    >
      <LanguageProvider>
        <MotionPreferenceProvider>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <ServiceWorkerProvider />
              {children}
            </ToastProvider>
          </QueryClientProvider>
        </MotionPreferenceProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
