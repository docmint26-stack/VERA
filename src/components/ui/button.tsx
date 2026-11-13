import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-[150ms] ease-[var(--ease-out)] focus-ring disabled:pointer-events-none disabled:opacity-55 active:scale-[0.985] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--brand)] text-white shadow-[var(--shadow-xs)] hover:bg-[var(--brand-hover)] active:bg-[var(--brand-active)]",
        secondary:
          "bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)] hover:border-[var(--border-strong)]",
        soft: "bg-[var(--brand-soft)] text-[var(--brand)] hover:bg-[var(--brand-soft-hover)]",
        ghost:
          "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)]",
        danger:
          "bg-[var(--error)] text-white hover:opacity-90",
        "danger-ghost":
          "bg-transparent text-[var(--error)] hover:bg-[var(--error-soft)]",
        link: "text-[var(--brand)] underline-offset-4 hover:underline px-0",
      },
      size: {
        sm: "h-8 px-3 text-[0.8125rem]",
        md: "h-[38px] px-4",
        lg: "h-11 px-5 text-[0.9375rem]",
        xl: "h-12 px-6 text-[0.9375rem]",
        icon: "h-[38px] w-[38px] p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-11 w-11 p-0",
      },
      rounded: {
        default: "",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner and disables interaction. */
  loading?: boolean;
  /** Accessible label for icon-only buttons. */
  iconLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      asChild = false,
      loading = false,
      iconLabel,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, rounded, className }))}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-label={iconLabel && !children ? iconLabel : props["aria-label"]}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin-slow" aria-hidden="true" />
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
