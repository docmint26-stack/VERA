"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Circular progress indicator with an animated arc and an optional
 * centre label. The number is announced once, not on every frame.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 88,
  stroke = 8,
  className,
  label,
  children,
  color,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  className?: string;
  label?: string;
  children?: React.ReactNode;
  color?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(max, value));
  const progress = clamped / max;

  const motionProgress = useMotionValue(0);
  const dash = useTransform(motionProgress, (p) => `${p * circumference} ${circumference}`);

  React.useEffect(() => {
    if (reduced) {
      motionProgress.set(progress);
      return;
    }
    const controls = animate(motionProgress, progress, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [progress, reduced, motionProgress]);

  const percent = Math.round(progress * 100);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      role="img"
      aria-label={label ?? `${percent}% complete`}
    >
      <svg width={size} height={size} aria-hidden="true" className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-elevated)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color ?? "var(--brand)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={dash}
          style={{ strokeDashoffset: 0 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <span className="text-h4 font-semibold tabular-nums">{percent}%</span>
        )}
      </div>
    </div>
  );
}
