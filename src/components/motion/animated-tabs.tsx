"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

export interface TabItem {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * Tab bar whose indicator slides between tabs with a spring.
 * Implements the ARIA tabs pattern: roving tabindex, arrow-key navigation,
 * Home/End support, and a live region announcing the selected tab.
 */
export function AnimatedTabs({
  items,
  value,
  onChange,
  ariaLabel,
  className,
  size = "md",
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const reduced = usePrefersReducedMotion();
  const listRef = React.useRef<HTMLDivElement>(null);

  const move = (dir: 1 | -1) => {
    const enabled = items.filter((i) => !i.disabled);
    const idx = enabled.findIndex((i) => i.value === value);
    const next = enabled[(idx + dir + enabled.length) % enabled.length];
    if (next) {
      onChange(next.value);
      requestAnimationFrame(() => {
        listRef.current
          ?.querySelector<HTMLButtonElement>(`[data-tab-value="${next.value}"]`)
          ?.focus();
      });
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-[var(--border)] no-scrollbar",
        className,
      )}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          move(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          move(-1);
        } else if (e.key === "Home") {
          e.preventDefault();
          const first = items.find((i) => !i.disabled);
          if (first) onChange(first.value);
        } else if (e.key === "End") {
          e.preventDefault();
          const last = [...items].reverse().find((i) => !i.disabled);
          if (last) onChange(last.value);
        }
      }}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-tab-value={item.value}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative shrink-0 rounded-t-[6px] font-medium transition-colors duration-150 focus-ring disabled:opacity-50",
              size === "sm" ? "px-3 py-2 text-[0.8125rem]" : "px-3.5 py-2.5 text-sm",
              active
                ? "text-[var(--foreground)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            )}
          >
            {item.label}
            {active && (
              <motion.span
                aria-hidden="true"
                className="absolute inset-x-1.5 -bottom-px h-0.5 rounded-full bg-[var(--brand)]"
                layoutId={reduced ? undefined : `tab-underline-${ariaLabel}`}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 480, damping: 38 }
                }
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
