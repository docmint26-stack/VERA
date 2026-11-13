import { cn } from "@/lib/utils";
import { VeraMark } from "@/components/branding/vera-mark";

/**
 * Static, decorative rendition of the VERA workspace used on marketing pages.
 * Marked `aria-hidden` — every fact it shows is repeated in real copy nearby.
 */
export function ProductMock({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-[var(--divider)] bg-[var(--surface)] px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--border-strong)]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-0.5 text-[0.625rem] font-medium text-[var(--muted-foreground)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
          vera.app / dashboard
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-[150px] shrink-0 flex-col gap-1 border-r border-[var(--divider)] p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-1.5">
            <VeraMark className="h-4 w-4" />
            <span className="text-[0.6875rem] font-semibold tracking-tight">VERA</span>
          </div>
          {["Dashboard", "VERA AI", "Documents", "My Vault", "My Passport", "Verification"].map(
            (label, i) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[0.6875rem]",
                  i === 0
                    ? "bg-[var(--brand-soft)] font-medium text-[var(--brand)]"
                    : "text-[var(--muted-foreground)]",
                )}
              >
                <span className="h-3 w-3 rounded-[3px] border border-current opacity-60" />
                {label}
              </div>
            ),
          )}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.625rem] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Thursday
              </p>
              <p className="text-base font-semibold tracking-tight">Good morning, Ayaan</p>
            </div>
            <div className="flex -space-x-1.5">
              {[0, 1, 2].map((n) => (
                <span
                  key={n}
                  className="h-6 w-6 rounded-full border-2 border-[var(--background)] bg-[var(--surface-elevated)]"
                />
              ))}
            </div>
          </div>

          {/* AI prompt bar */}
          <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-[var(--brand)] text-[0.5rem] font-bold text-white">
              V
            </span>
            <span className="text-[0.75rem] text-[var(--muted-foreground)]">Ask VERA anything…</span>
            <span className="ml-auto rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 text-[0.5625rem] text-[var(--subtle-foreground)]">
              ⌘K
            </span>
          </div>

          {/* Cards */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.625rem] font-medium text-[var(--muted-foreground)]">
                  Passport strength
                </span>
                <span className="text-[0.625rem] font-semibold text-[var(--success)]">+12</span>
              </div>
              <div className="mt-2.5 flex items-end gap-1">
                {[38, 52, 46, 64, 71, 84].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h * 0.5}px` }}
                    className={cn(
                      "w-full rounded-[2px]",
                      i === 5 ? "bg-[var(--brand)]" : "bg-[var(--brand-soft)]",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[var(--radius-sm)] border border-[var(--border)] p-3">
              <span className="text-[0.625rem] font-medium text-[var(--muted-foreground)]">
                Verification
              </span>
              <div className="mt-2.5 space-y-1.5">
                {[
                  { label: "Issuer-Verified", dot: "bg-[var(--success)]" },
                  { label: "AI-Assessed", dot: "bg-[var(--brand)]" },
                  { label: "Submitted", dot: "bg-[var(--border-strong)]" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", row.dot)} />
                    <span className="text-[0.625rem] text-[var(--muted-foreground)]">{row.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document rows */}
          <div className="mt-3 divide-y divide-[var(--divider)] rounded-[var(--radius-sm)] border border-[var(--border)]">
            {["Product Designer CV", "Research summary — LLM eval", "Q3 project report"].map((name, i) => (
              <div key={name} className="flex items-center gap-2.5 px-3 py-2">
                <span className="h-4 w-4 rounded-[3px] border border-[var(--border-strong)] bg-[var(--surface)]" />
                <span className="truncate text-[0.6875rem]">{name}</span>
                <span className="ml-auto shrink-0 text-[0.5625rem] text-[var(--subtle-foreground)]">
                  {["2m", "1h", "Yesterday"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hero decorative backdrop grid. */
export function HeroBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid-backdrop pointer-events-none absolute inset-0 -z-10 opacity-70",
        className,
      )}
    />
  );
}
