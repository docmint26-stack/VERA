import * as React from "react";
import { cn } from "@/lib/utils";

export function TooltipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

/**
 * Lightweight tooltip that works without Radix so it can be used in both
 * collapsed and expanded sidebars. Shows on hover and keyboard focus,
 * and is always mirrored in accessible text.
 */
export function Tooltip({
  content,
  side = "right",
  children,
  disabled,
}: {
  content: string;
  side?: "right" | "left" | "top" | "bottom";
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  const position =
    side === "right"
      ? "left-full top-1/2 ml-2 -translate-y-1/2"
      : side === "left"
        ? "right-full top-1/2 mr-2 -translate-y-1/2"
        : side === "top"
          ? "bottom-full left-1/2 mb-2 -translate-x-1/2"
          : "top-full left-1/2 mt-2 -translate-x-1/2";

  if (disabled) return <>{children}</>;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      {children}
      <span
        role="tooltip"
        id={id}
        data-state={open ? "open" : "closed"}
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-[6px] bg-[var(--foreground)] px-2.5 py-1.5 text-[0.75rem] font-medium text-[var(--background)] shadow-[var(--shadow-md)]",
          position,
          "transition-[opacity,transform] duration-150 ease-[var(--ease-out)]",
          open ? "scale-100 opacity-100" : "scale-95 opacity-0",
        )}
        aria-hidden={!open}
      >
        {content}
      </span>
    </span>
  );
}
