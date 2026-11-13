import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2 text-sm text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150",
          "placeholder:text-[var(--subtle-foreground)]",
          "hover:border-[var(--border-strong)]",
          "focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-[var(--border)]",
          "aria-[invalid=true]:border-[var(--error)] aria-[invalid=true]:focus:ring-[rgb(220_38_38_0.18)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

/** Wraps an input with an optional leading/trailing adornment. */
export function InputGroup({
  className,
  leading,
  trailing,
  children,
}: {
  className?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center",
        className,
      )}
    >
      {leading && (
        <span className="pointer-events-none absolute left-3 flex text-[var(--subtle-foreground)]">
          {leading}
        </span>
      )}
      {children}
      {trailing && (
        <span className="absolute right-2 flex items-center">{trailing}</span>
      )}
    </div>
  );
}
