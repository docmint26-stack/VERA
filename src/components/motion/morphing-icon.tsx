"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Swaps between two icons with a rotate/scale morph.
 * Used for state affordances: search ↔ close, play ↔ stop, chevrons.
 */
export function MorphingIcon({
  icon: Icon,
  altIcon: AltIcon,
  active = false,
  className,
  size = 18,
  label,
}: {
  icon: LucideIcon;
  altIcon: LucideIcon;
  active?: boolean;
  className?: string;
  size?: number;
  label?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const Current = active ? AltIcon : Icon;

  return (
    <span
      className={cn("relative inline-flex", className)}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={active ? "alt" : "default"}
          className="absolute inset-0 flex items-center justify-center"
          initial={reduced ? undefined : { opacity: 0, rotate: -45, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, rotate: 45, scale: 0.7 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Current size={size} strokeWidth={2} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Rotating/morphing glyph used for "thinking" or "processing" states. */
export function SpinGlyph({
  icon: Icon,
  className,
  size = 16,
}: {
  icon: LucideIcon;
  className?: string;
  size?: number;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.span
      className={cn("inline-flex", className)}
      aria-hidden="true"
      animate={reduced ? undefined : { rotate: 360 }}
      transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
    >
      <Icon size={size} />
    </motion.span>
  );
}
