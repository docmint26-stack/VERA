import * as React from "react";
import { cn } from "@/lib/utils";

/** Renders a keyboard key. Always pair with a visible action label. */
export function Kbd({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-1.5 font-mono text-[0.625rem] font-medium text-[var(--muted-foreground)] shadow-[var(--shadow-xs)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
