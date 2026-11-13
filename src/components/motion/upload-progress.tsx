"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, FileUp, Check, AlertTriangle } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui/popover";
import { usePrefersReducedMotion } from "./motion-pref";

export type UploadStatus = "uploading" | "complete" | "error";

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
}

/**
 * Per-file upload progress with a status morph (uploading → done/failed).
 * Phase 1 drives this from local file selection only — nothing leaves
 * the browser until storage integration lands in Phase 2.
 */
export function UploadProgress({
  items,
  onRemove,
  className,
}: {
  items: UploadItem[];
  onRemove?: (id: string) => void;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  if (items.length === 0) return null;

  return (
    <ul className={cn("flex flex-col gap-2", className)} aria-label="Selected files">
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.li
            key={item.id}
            layout={!reduced}
            initial={reduced ? undefined : { opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={reduced ? undefined : { opacity: 0, height: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 py-2.5">
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px]",
                  item.status === "complete"
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : item.status === "error"
                      ? "bg-[var(--error-soft)] text-[var(--error)]"
                      : "bg-[var(--brand-soft)] text-[var(--brand)]",
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={item.status}
                    initial={reduced ? undefined : { rotate: -30, scale: 0.7, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={reduced ? undefined : { rotate: 30, scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {item.status === "complete" ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : item.status === "error" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <FileUp className="h-4 w-4" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[0.8125rem] font-medium">{item.name}</p>
                  <span className="shrink-0 text-[0.6875rem] tabular-nums text-[var(--muted-foreground)]">
                    {item.status === "complete"
                      ? "Done"
                      : item.status === "error"
                        ? "Failed"
                        : `${item.progress}%`}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress
                    value={item.progress}
                    label={`${item.name} upload progress`}
                    className={cn(
                      "h-1.5 flex-1",
                      item.status === "complete" && "[&>span]:bg-[var(--success)]",
                      item.status === "error" && "[&>span]:bg-[var(--error)]",
                    )}
                  />
                  <span className="shrink-0 text-[0.6875rem] tabular-nums text-[var(--subtle-foreground)]">
                    {formatBytes(item.size)}
                  </span>
                </div>
              </div>

              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--muted-foreground)] transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] focus-ring"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
