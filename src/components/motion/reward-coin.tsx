"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Coin that flips in once when points are actually awarded, then settles.
 * Only animates on a real user-triggered state change — never on a loop.
 */
export function RewardCoinAnimation({
  show,
  amount,
  label = "points earned",
  onDone,
  className,
}: {
  show: boolean;
  amount: number;
  label?: string;
  onDone?: () => void;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  React.useEffect(() => {
    if (!show || reduced) return;
    const t = window.setTimeout(() => onDone?.(), 1400);
    return () => window.clearTimeout(t);
  }, [show, reduced, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            "pointer-events-none fixed inset-x-0 top-1/3 z-50 flex flex-col items-center gap-3",
            className,
          )}
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
        >
          <motion.span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-[var(--shadow-brand)]"
            style={{ transformStyle: "preserve-3d" }}
            animate={reduced ? undefined : { rotateY: [0, 360], scale: [0.7, 1.08, 1] }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Coins className="h-7 w-7" aria-hidden="true" />
          </motion.span>
          <motion.p
            className="rounded-full bg-[var(--background)] px-4 py-2 text-sm font-semibold shadow-[var(--shadow-lg)]"
            initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.28 }}
          >
            +{formatNumber(amount)} {label}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Inline "+N pts" chip that pops when a transaction lands. */
export function PointsDelta({
  amount,
  show,
  className,
}: {
  amount: number;
  show: boolean;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <AnimatePresence>
      {show && (
        <motion.span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--success)]",
            className,
          )}
          initial={reduced ? undefined : { opacity: 0, scale: 0.7, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          aria-label={`${amount} points earned`}
        >
          +{amount}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
