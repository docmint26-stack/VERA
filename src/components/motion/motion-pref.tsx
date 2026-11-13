"use client";

import * as React from "react";
import { MotionConfig } from "motion/react";
import { readStorage, writeStorage, isBrowser } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";

export type MotionPreference = "system" | "reduced" | "full";

interface MotionContextValue {
  preference: MotionPreference;
  setPreference: (value: MotionPreference) => void;
  reduced: boolean;
}

const MotionContext = React.createContext<MotionContextValue>({
  preference: "system",
  setPreference: () => {},
  reduced: false,
});

export function useMotionPreference() {
  return React.useContext(MotionContext);
}

function systemPrefersReduced() {
  if (!isBrowser()) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveReduced(preference: MotionPreference) {
  if (preference === "reduced") return true;
  if (preference === "full") return false;
  return systemPrefersReduced();
}

/**
 * Applies the reduced-motion preference to the document so both the Motion
 * library and raw CSS animations honour it. Users can override the system
 * setting from Settings → Appearance.
 */
export function MotionPreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreferenceState] = React.useState<MotionPreference>(() => {
    const stored = readStorage(STORAGE_KEYS.themeMotion);
    if (stored === "reduced" || stored === "full" || stored === "system") {
      return stored;
    }
    return "system";
  });

  const reduced = resolveReduced(preference);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = reduced ? "reduced" : "full";
  }, [reduced]);

  React.useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      document.documentElement.dataset.motion = media.matches ? "reduced" : "full";
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = React.useCallback((next: MotionPreference) => {
    setPreferenceState(next);
    writeStorage(STORAGE_KEYS.themeMotion, next);
  }, []);

  const value = React.useMemo(
    () => ({ preference, setPreference, reduced }),
    [preference, setPreference, reduced],
  );

  return (
    <MotionContext.Provider value={value}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}

/** True when motion should be suppressed (user override or OS setting). */
export function usePrefersReducedMotion() {
  return React.useContext(MotionContext).reduced;
}
