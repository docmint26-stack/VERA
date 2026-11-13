"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePrefersReducedMotion } from "./motion-pref";

interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Smooth modal/dialog transition with backdrop and content animations.
 * Supports both fade-in and slide-up patterns with reduced motion support.
 */
export function ModalTransition({ children, isOpen, onClose, className }: ModalTransitionProps) {
  const reduced = usePrefersReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onClose}>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
            initial={reduced ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            className={className}
            initial={reduced ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
