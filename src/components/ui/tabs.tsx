"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-start gap-1 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--muted-foreground)]",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[6px] px-3 py-1.5 text-[0.8125rem] font-medium transition-all duration-150 focus-ring",
      "data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)] data-[state=active]:shadow-[var(--shadow-xs)]",
      "data-[state=inactive]:hover:text-[var(--foreground)]",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 focus-ring data-[state=active]:animate-fade-up",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

/**
 * Underline-style tab bar used for page-level sections.
 * The active indicator is an animated motion.div so it slides between tabs.
 */
export function UnderlineTabs({
  tabs,
  value,
  onValueChange,
  className,
  ariaLabel,
}: {
  tabs: Array<{ value: string; label: React.ReactNode; disabled?: boolean }>;
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-[var(--border)] no-scrollbar",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={value === tab.value}
          tabIndex={value === tab.value ? 0 : -1}
          disabled={tab.disabled}
          onClick={() => onValueChange(tab.value)}
          className={cn(
            "relative shrink-0 px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 focus-ring",
            value === tab.value
              ? "text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
            "disabled:opacity-50",
          )}
        >
          {tab.label}
          {value === tab.value && (
            <span
              aria-hidden="true"
              className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[var(--brand)]"
              style={{ animation: "fade-in 200ms var(--ease-out)" }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
