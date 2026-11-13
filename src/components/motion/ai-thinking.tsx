"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

const DOTS = 3;

/**
 * "Assistant is thinking" indicator: a pulsing glyph followed by three
 * dots that fill in sequence. Static dots under reduced motion.
 * Never runs when `active` is false, so it can't distract at rest.
 */
export function AIThinkingIndicator({
  active = true,
  label = "VERA is thinking",
  className,
  compact = false,
}: {
  active?: boolean;
  label?: string;
  className?: string;
  compact?: boolean;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className={cn("flex items-center gap-2.5", className)}
          initial={reduced ? undefined : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
        >
          <motion.span
            aria-hidden="true"
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]"
            animate={reduced ? undefined : { scale: [1, 1.12, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </motion.span>
          {!compact && (
            <span className="text-[0.8125rem] font-medium text-[var(--muted-foreground)]">
              {label}
            </span>
          )}
          <span className="flex items-center gap-1" aria-hidden="true">
            {Array.from({ length: DOTS }).map((_, i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]"
                animate={
                  reduced ? { opacity: 0.45 } : { opacity: [0.25, 1, 0.25] }
                }
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.16,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
          <span className="sr-only">{label}…</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Full-width thinking row used inside the chat canvas. */
export function AIThinkingRow({ active }: { active: boolean }) {
  return (
    <div className="flex items-start gap-3" aria-hidden={!active}>
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div className="rounded-[var(--radius-md)] rounded-tl-[4px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <AIThinkingIndicator active={active} />
      </div>
    </div>
  );
}
