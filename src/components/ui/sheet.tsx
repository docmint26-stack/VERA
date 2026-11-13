"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const sheetVariants = cva(
  "fixed z-50 flex flex-col bg-[var(--background)] shadow-[var(--shadow-lg)] focus:outline-none",
  {
    variants: {
      side: {
        left:
          "inset-y-0 left-0 h-full w-[min(88vw,340px)] border-r border-[var(--border)] data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0",
        right:
          "inset-y-0 right-0 h-full w-[min(92vw,420px)] border-l border-[var(--border)] data-[state=closed]:translate-x-full data-[state=open]:translate-x-0",
        bottom:
          "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[var(--radius-xl)] border-t border-[var(--border)] data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: VariantProps<typeof sheetVariants>["side"];
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Hides the built-in header (the caller supplies its own). */
  bare?: boolean;
}

/**
 * Slide-over panel used for mobile navigation and detail drawers.
 * Built on Radix Dialog so focus trapping and Escape work for free.
 */
export function Sheet({
  open,
  onOpenChange,
  side = "right",
  title,
  description,
  children,
  className,
  bare = false,
}: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[var(--overlay)] data-[state=open]:animate-fade-in data-[state=closed]:opacity-0 [transition:opacity_200ms_var(--ease-out)]" />
        <DialogPrimitive.Content
          className={cn(
            sheetVariants({ side }),
            "[transition:transform_300ms_var(--ease-out)]",
            "focus:outline-none",
            className,
          )}
          aria-describedby={description ? undefined : undefined}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="sr-only">
              {description}
            </DialogPrimitive.Description>
          )}
          {!description && (
            <DialogPrimitive.Description className="sr-only">
              {title}
            </DialogPrimitive.Description>
          )}
          {!bare && (
            <div className="flex items-center justify-between border-b border-[var(--divider)] px-5 py-4">
              <span className="text-h4 font-semibold">{title}</span>
              <DialogPrimitive.Close
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] focus-ring"
                aria-label="Close"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </DialogPrimitive.Close>
            </div>
          )}
          {bare && (
            <DialogPrimitive.Close
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] focus-ring"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </DialogPrimitive.Close>
          )}
          <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
