"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

export interface AnimatedButtonProps extends ButtonProps {
  /** Renders a success morph for `successDuration` ms after `success` flips true. */
  success?: boolean;
  successDuration?: number;
  /** Label shown during the success morph. Defaults to `children`. */
  successMessage?: React.ReactNode;
  /** Fires when the success state auto-clears. */
  onResetSuccess?: () => void;
}

/**
 * Button with a Jitter-style label morph: idle → loading → success.
 * Icon and label cross-fade instead of jumping; the whole sequence
 * collapses to a static state under reduced motion.
 */
export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      success = false,
      successDuration = 1800,
      successMessage,
      onResetSuccess,
      children,
      className,
      loading,
      ...props
    },
    ref,
  ) => {
    const reduced = usePrefersReducedMotion();
    const [showSuccess, setShowSuccess] = React.useState(false);

    React.useEffect(() => {
      if (!success) {
        setShowSuccess(false);
        return;
      }
      setShowSuccess(true);
      if (reduced) return;
      const timer = window.setTimeout(() => {
        setShowSuccess(false);
        onResetSuccess?.();
      }, successDuration);
      return () => window.clearTimeout(timer);
    }, [success, successDuration, onResetSuccess, reduced]);

    const duration = reduced ? 0 : 0.18;

    return (
      <Button
        ref={ref}
        loading={loading}
        className={cn(className)}
        aria-live="polite"
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {showSuccess ? (
            <motion.span
              key="success"
              className="flex items-center gap-2"
              initial={reduced ? undefined : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.9 }}
              transition={{ duration }}
            >
              <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
              {successMessage ?? children}
            </motion.span>
          ) : (
            <motion.span
              key="default"
              className="flex items-center gap-2"
              initial={reduced ? undefined : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 0.97 }}
              transition={{ duration: reduced ? 0 : 0.15 }}
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";
