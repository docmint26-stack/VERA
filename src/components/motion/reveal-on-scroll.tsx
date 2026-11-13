"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

type RevealProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Delay before the entrance starts, in ms. */
  delay?: number;
  /** Vertical offset in px. */
  y?: number;
  /** Render as a different element (e.g. `section`, `li`). */
  as?: keyof React.JSX.IntrinsicElements;
  /** Stagger index — increments delay by `step` for each sibling. */
  index?: number;
  /** Per-item stagger increment in ms. */
  step?: number;
};

/**
 * Reveals content as it scrolls into view. Content stays in the DOM and
 * visible to assistive technology; only transform/opacity animate.
 * Disabled entirely when reduced motion is preferred.
 */
export function RevealOnScroll({
  children,
  className,
  delay = 0,
  y = 16,
  as = "div",
  index,
  step = 70,
  ...props
}: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px -60px 0px" });

  const computedDelay = delay + (index !== undefined ? index * step : 0);
  const Component = motion[as as "div"] as typeof motion.div;

  if (reduced) {
    const Tag = as as React.ElementType;
    return (
      <Tag ref={ref} className={className} {...props}>
        {children}
      </Tag>
    );
  }

  return (
    <Component
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(className)}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration: 0.55,
        delay: computedDelay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </Component>
  );
}

/** Convenience wrapper that reveals a group of children with a stagger. */
export function RevealGroup({
  children,
  className,
  step = 70,
  y = 16,
}: {
  children: React.ReactNode;
  className?: string;
  step?: number;
  y?: number;
}) {
  const reduced = usePrefersReducedMotion();
  const items = React.Children.toArray(children);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div className={className}>
      {items.map((child, i) => (
        <RevealOnScroll key={i} index={i} step={step} y={y}>
          {child}
        </RevealOnScroll>
      ))}
    </div>
  );
}
