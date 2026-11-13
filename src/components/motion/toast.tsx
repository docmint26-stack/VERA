"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "./motion-pref";

export type ToastVariant = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const TONE: Record<ToastVariant, string> = {
  success: "var(--success)",
  info: "var(--info)",
  warning: "var(--warning)",
  error: "var(--error)",
};

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const reduced = usePrefersReducedMotion();
  const timers = React.useRef(new Map<string, number>());

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = React.useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID?.() ?? `toast-${Date.now()}-${Math.random()}`;
      const item: ToastItem = { variant: "info", duration: 4500, ...toast, id };
      setToasts((prev) => [...prev.slice(-2), item]);
      const duration = item.duration ?? 4500;
      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss],
  );

  React.useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => window.clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2.5 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] sm:items-end sm:right-4 sm:left-auto sm:pb-4"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout={!reduced}
              initial={reduced ? undefined : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-lg)]"
              role={toast.variant === "error" ? "alert" : "status"}
              aria-live={toast.variant === "error" ? "assertive" : "polite"}
            >
              <div className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0"
                  style={{ color: TONE[toast.variant ?? "info"] }}
                >
                  {React.createElement(ICONS[toast.variant ?? "info"], {
                    className: "h-[18px] w-[18px]",
                  })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.875rem] font-semibold">{toast.title}</p>
                  {toast.description && (
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
                      {toast.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="-mt-1 -mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] focus-ring"
                  aria-label="Dismiss notification"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

/** Standalone toast card for isolated usages (tests, demos). */
export function ToastNotification({
  title,
  description,
  variant = "info",
  onDismiss,
  className,
}: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  onDismiss?: () => void;
  className?: string;
}) {
  const Icon = ICONS[variant];
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4 shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <div className="flex gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 shrink-0"
          style={{ color: TONE[variant] }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.875rem] font-semibold">{title}</p>
          {description && (
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted-foreground)]">
              {description}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="-mt-1 -mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--muted-foreground)] hover:bg-[var(--surface-elevated)] focus-ring"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
