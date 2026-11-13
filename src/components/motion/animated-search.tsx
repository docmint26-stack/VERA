"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/separator";
import { usePrefersReducedMotion } from "./motion-pref";

/**
 * Search field that expands on focus, lifts its shadow and reveals a
 * clear action — the interaction pattern from the Jitter UI catalogue,
 * rebuilt on the VERA design tokens.
 */
export function AnimatedSearch({
  value,
  onChange,
  onSubmit,
  placeholder = "Search…",
  className,
  autoFocus,
  id,
  showShortcut = true,
  loading = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  id?: string;
  showShortcut?: boolean;
  loading?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const active = focused || value.length > 0;

  return (
    <motion.div
      className={cn("relative", className)}
      animate={
        reduced
          ? undefined
          : {
              boxShadow: active
                ? "0 0 0 4px var(--brand-ring), var(--shadow-md)"
                : "0 0 0 0px transparent, var(--shadow-xs)",
            }
      }
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative flex items-center">
        <Search
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-3.5 h-4 w-4 transition-colors duration-150",
            active ? "text-[var(--brand)]" : "text-[var(--subtle-foreground)]",
          )}
        />
        <input
          ref={inputRef}
          id={id}
          type="search"
          role="searchbox"
          value={value}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onSubmit) {
              e.preventDefault();
              onSubmit();
            }
            if (e.key === "Escape" && value) {
              e.preventDefault();
              onChange("");
            }
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            "h-10 w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] pl-10 pr-24 text-sm text-[var(--foreground)]",
            "placeholder:text-[var(--subtle-foreground)]",
            "focus:border-[var(--brand)] focus:outline-none",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        <div className="pointer-events-none absolute right-2.5 flex items-center gap-1.5">
          <AnimatePresence>
            {value.length > 0 && (
              <motion.button
                key="clear"
                type="button"
                initial={reduced ? undefined : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={() => {
                  onChange("");
                  inputRef.current?.focus();
                }}
                className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] focus-ring"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </AnimatePresence>
          {!value && showShortcut && (
            <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </span>
          )}
          {value.length > 0 && onSubmit && (
            <span aria-hidden="true" className="hidden text-[var(--subtle-foreground)] sm:block">
              <CornerDownLeft className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
      {loading && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden rounded-full"
        >
          <span className="block h-full w-full animate-shimmer bg-[linear-gradient(90deg,transparent,var(--brand),transparent)] bg-[length:200%_100%]" />
        </span>
      )}
    </motion.div>
  );
}
