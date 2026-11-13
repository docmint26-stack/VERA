"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Route-level entrance. Renders a short fade+rise when the pathname changes
 * and is a no-op under reduced motion. It never delays content: children are
 * always in the DOM.
 */
export function PageTransition({
  children,
  className,
  /** Unique key per route so the animation re-fires on navigation. */
  routeKey,
}: {
  children: React.ReactNode;
  className?: string;
  routeKey?: string;
}) {
  const reduced = usePrefersReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      key={routeKey}
      className={cn(className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Wrapper used around dialogs and drawers so panels enter/exit with a
 * consistent curve. Radix already handles presence; this adds the motion.
 */
export function PanelTransition({
  children,
  className,
  side = "center",
}: {
  children: React.ReactNode;
  className?: string;
  side?: "center" | "bottom" | "right" | "left";
}) {
  const reduced = usePrefersReducedMotion();
  const offset =
    side === "bottom"
      ? { y: 32 }
      : side === "right"
        ? { x: 32 }
        : side === "left"
          ? { x: -32 }
          : { scale: 0.97 };

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, ...offset }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
