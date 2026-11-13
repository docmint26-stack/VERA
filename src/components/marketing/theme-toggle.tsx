"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Cycles light → dark → system. next-themes keeps `data-theme` in sync and
 * persists the choice under `vera-theme`.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const current = theme ?? "light";
  const next = current === "light" ? "dark" : current === "dark" ? "system" : "light";

  const label =
    current === "light" ? "Switch to dark mode" : current === "dark" ? "Switch to system theme" : "Switch to light mode";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
    >
      {current === "dark" ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : current === "system" ? (
        <SystemGlyph className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  );
}

function SystemGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
