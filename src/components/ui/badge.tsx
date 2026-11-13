import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.75rem] font-medium leading-5 transition-colors",
  {
    variants: {
      variant: {
        neutral:
          "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
        brand:
          "border-transparent bg-[var(--brand-soft)] text-[var(--brand)]",
        success:
          "border-transparent bg-[var(--success-soft)] text-[var(--success)]",
        warning:
          "border-transparent bg-[var(--warning-soft)] text-[var(--warning)]",
        error: "border-transparent bg-[var(--error-soft)] text-[var(--error)]",
        info: "border-transparent bg-[var(--info-soft)] text-[var(--info)]",
        outline:
          "border-[var(--border-strong)] bg-transparent text-[var(--foreground)]",
        solid:
          "border-transparent bg-[var(--foreground)] text-[var(--background)]",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.6875rem]",
        md: "px-2.5 py-0.5 text-[0.75rem]",
        lg: "px-3 py-1 text-[0.8125rem]",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Adds a small status dot. Always pair with a readable label. */
  dot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
        />
      )}
      {children}
    </span>
  );
}

export { badgeVariants };
