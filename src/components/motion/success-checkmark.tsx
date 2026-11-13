"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Draws a checkmark with an SVG stroke animation and an expanding ring.
 * Announces the success message to assistive technology exactly once.
 */
export function SuccessCheckmark({
  show = true,
  size = 56,
  message,
  className,
  tone = "success",
  onComplete,
}: {
  show?: boolean;
  size?: number;
  message?: string;
  className?: string;
  tone?: "success" | "brand" | "error";
  onComplete?: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "error"
        ? "var(--error)"
        : "var(--brand)";

  React.useEffect(() => {
    if (!show || reduced) return;
    const t = window.setTimeout(() => onComplete?.(), 900);
    return () => window.clearTimeout(t);
  }, [show, reduced, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn("flex flex-col items-center gap-3", className)}
          initial={reduced ? undefined : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="relative inline-flex" style={{ width: size, height: size }}>
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                border: `2px solid ${color}`,
                opacity: 0,
                animation: reduced
                  ? undefined
                  : "vera-pulse-ring 900ms var(--ease-out) 220ms 1",
              }}
            />
            <svg
              viewBox="0 0 56 56"
              width={size}
              height={size}
              aria-hidden="true"
              className="absolute inset-0"
            >
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke={color}
                strokeWidth="3"
                opacity="0.22"
              />
              <motion.path
                d="M17 29 L24.5 36.5 L39 20"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduced ? undefined : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
          </span>
          {message && (
            <span className="text-sm font-medium" style={{ color }}>
              {message}
            </span>
          )}
          <span className="sr-only" role="status">
            {message ?? "Success"}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
