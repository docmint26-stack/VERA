import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-[var(--radius-md)] border px-4 py-3.5 text-sm",
  {
    variants: {
      variant: {
        info: "border-[var(--info)]/25 bg-[var(--info-soft)] text-[var(--foreground)]",
        success:
          "border-[var(--success)]/25 bg-[var(--success-soft)] text-[var(--foreground)]",
        warning:
          "border-[var(--warning)]/30 bg-[var(--warning-soft)] text-[var(--foreground)]",
        error: "border-[var(--error)]/25 bg-[var(--error-soft)] text-[var(--foreground)]",
        neutral: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
        pending:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  icon?: React.ReactNode;
  title?: React.ReactNode;
}

export function Alert({
  className,
  variant,
  icon,
  title,
  children,
  ...props
}: AlertProps) {
  return (
    <div role="status" className={cn(alertVariants({ variant }), className)} {...props}>
      {icon && (
        <span aria-hidden="true" className="mr-2.5 inline-flex align-middle text-[var(--muted-foreground)]">
          {icon}
        </span>
      )}
      <span className="inline align-middle">
        {title && <strong className="font-semibold">{title} </strong>}
        {children}
      </span>
    </div>
  );
}

/**
 * Explicitly marks a control or panel as "awaiting backend integration".
 * Every backend-dependent capability in Phase 1 uses this instead of
 * pretending the action succeeded.
 */
export function IntegrationPending({
  className,
  feature,
  children,
}: {
  className?: string;
  feature: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-[0.8125rem] font-medium text-[var(--muted-foreground)]">
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--warning)]"
        />
        {feature} — awaiting integration
      </p>
      {children && (
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--subtle-foreground)]">
          {children}
        </p>
      )}
    </div>
  );
}
