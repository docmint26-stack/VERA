"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePrefersReducedMotion } from "./motion-pref";

interface SidebarTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

/**
 * Smooth transition for sidebar expand/collapse animations.
 * Handles both enter and exit animations with proper motion preferences.
 */
export function SidebarTransition({ children, isOpen, className }: SidebarTransitionProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isOpen && (
        <motion.div
          className={className}
          initial={reduced ? undefined : { opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={reduced ? undefined : { opacity: 0, width: 0 }}
          transition={{ duration: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
