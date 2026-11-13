"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn, readStorage, writeStorage } from "@/lib/utils";
import { STORAGE_KEYS } from "@/lib/constants";
import { AnimatedLogo } from "./animated-logo";
import { usePrefersReducedMotion } from "./motion-pref";

const MAX_DURATION = 1600;

/**
 * First-visit brand intro.
 *
 * Guarantees from the VERA spec:
 *  - never blocks content (renders in an overlay above the shell, removed by a timer)
 *  - plays at most once per browser session
 *  - fully skipped when the user prefers reduced motion
 *  - skippable by click, key press, or pointer interaction
 *  - no hydration mismatch (visibility is decided after mount)
 */
export function SplashScreen() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = React.useState(() => {
    if (reduced) return false;
    return readStorage(STORAGE_KEYS.splashSeen) !== "1";
  });
  const [dismissed, setDismissed] = React.useState(() => {
    if (reduced) return true;
    return readStorage(STORAGE_KEYS.splashSeen) === "1";
  });

  React.useEffect(() => {
    if (dismissed || reduced) return;
    const finish = () => {
      setDismissed(true);
      setVisible(false);
      writeStorage(STORAGE_KEYS.splashSeen, "1");
    };

    const timer = window.setTimeout(finish, MAX_DURATION);
    const skip = () => finish();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [reduced, dismissed]);

  if (dismissed || reduced) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="vera-splash"
          role="status"
          aria-label="VERA is loading"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--background)]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => {
            setDismissed(true);
            setVisible(false);
            writeStorage(STORAGE_KEYS.splashSeen, "1");
          }}
        >
          <span className="pointer-events-none absolute inset-0 grid-backdrop opacity-70" />
          <div className="relative flex flex-col items-center">
            <AnimatedLogo size="lg" />
            <span
              aria-hidden="true"
              className="absolute -inset-8 rounded-full border-2 border-[var(--brand)] opacity-0"
              style={{ animation: "vera-pulse-ring 900ms var(--ease-out) 780ms 1" }}
            />
            <p
              className={cn(
                "mt-5 text-[0.8125rem] font-medium tracking-[0.18em] text-[var(--muted-foreground)] uppercase",
              )}
              style={{ animation: "fade-up 420ms var(--ease-out) 700ms both" }}
            >
              Ask. Create. Prove.
            </p>
          </div>
          <button
            type="button"
            className="absolute bottom-8 text-[0.75rem] font-medium text-[var(--subtle-foreground)] transition-colors hover:text-[var(--muted-foreground)] focus-ring rounded px-3 py-2"
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
