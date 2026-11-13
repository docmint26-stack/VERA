"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Counts from `from` to `value` when it enters the viewport.
 * Announces only the final value to screen readers.
 */
export function AnimatedCounter({
  value,
  from = 0,
  duration = 900,
  format,
  className,
  prefix = "",
  suffix = "",
  decimals = 0,
  ariaLabel,
}: {
  value: number;
  from?: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  ariaLabel?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const motionValue = useMotionValue(from);
  const ref = React.useRef<HTMLSpanElement>(null);
  const [started, setStarted] = React.useState(false);

  const render = React.useCallback(
    (n: number) =>
      format
        ? format(n)
        : n.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
    [format, decimals],
  );

  const text = useTransform(motionValue, (latest) => `${prefix}${render(latest)}${suffix}`);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!started) return;
    if (reduced) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: duration / 1000,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [started, value, duration, reduced, motionValue]);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      aria-label={ariaLabel ?? `${prefix}${render(value)}${suffix}`}
    >
      <motion.span aria-hidden="true">{reduced ? render(value) : text}</motion.span>
    </span>
  );
}
