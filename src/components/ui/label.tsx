"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none text-[var(--foreground)] peer-disabled:cursor-not-allowed peer-disabled:opacity-60",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

/** Small uppercase caption used above form sections. */
export function FieldLabel({
  children,
  htmlFor,
  hint,
  required,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={htmlFor}>
        {children}
        {required && (
          <span className="ml-1 text-[var(--error)]" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {hint && (
        <span className="text-caption">{hint}</span>
      )}
    </div>
  );
}

/** Accessible inline error message bound to a control via aria-describedby. */
export function FieldError({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-start gap-1.5 text-[0.8125rem] leading-snug text-[var(--error)]"
    >
      <span aria-hidden="true" className="mt-[1px]">
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
