"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { VeraMark } from "@/components/branding/vera-mark";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Animated VERA mark. Plays the stroke-draw sequence once on mount and
 * falls back to the static mark when motion is reduced.
 */
export function AnimatedLogo({
  className,
  showWordmark = false,
  size = "md",
  play = true,
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  play?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const shouldAnimate = play && !reduced;

  const sizes = {
    sm: { mark: "h-6 w-6", text: "text-base" },
    md: { mark: "h-8 w-8", text: "text-xl" },
    lg: { mark: "h-12 w-12", text: "text-3xl" },
    xl: { mark: "h-16 w-16", text: "text-4xl" },
  }[size];

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <VeraMark className={sizes.mark} animated={shouldAnimate} />
      {showWordmark && (
        <span
          aria-hidden="true"
          className={cn(
            "font-semibold tracking-[-0.04em] text-[var(--foreground)]",
            sizes.text,
          )}
          style={
            shouldAnimate
              ? { animation: "fade-up 480ms var(--ease-out) 620ms both" }
              : undefined
          }
        >
          VERA
        </span>
      )}
    </span>
  );
}
