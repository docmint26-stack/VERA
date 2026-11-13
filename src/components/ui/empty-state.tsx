import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Shared empty state used across every VERA module.
 * Always explains what would appear here and offers one clear next step.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--surface)] text-center",
        compact ? "px-5 py-8" : "px-6 py-14",
        className,
      )}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className="mb-4 flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <h3 className="text-h4 font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-[0.875rem] leading-relaxed text-[var(--muted-foreground)]">
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
      {children}
    </div>
  );
}

/** Standard page-level header used by app routes. */
export function PageHeader({
  title,
  description,
  actions,
  className,
  eyebrow,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="text-overline mb-2">{eyebrow}</p>}
        <h1 className="text-h2 font-semibold tracking-[-0.025em]">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/**
 * Honest status chip for capabilities that are not backed by a live service.
 * Phase 1 uses this wherever a real backend would be required.
 */
export function DemoBadge({ label = "Demo data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[0.6875rem] font-medium text-[var(--muted-foreground)]">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
      {label}
    </span>
  );
}

/** Wrapper that keeps page content in the shared container width. */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

export function SectionButtonFallback({ label }: { label: string }) {
  return (
    <Button variant="secondary" size="sm" disabled>
      {label}
    </Button>
  );
}
