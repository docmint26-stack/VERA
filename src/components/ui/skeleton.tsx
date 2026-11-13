import { cn } from "@/lib/utils";

/** Shimmering placeholder used while content loads. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-[var(--radius-sm)] bg-[linear-gradient(90deg,var(--surface-elevated)_0%,var(--surface)_50%,var(--surface-elevated)_100%)] bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

/** Alias for Skeleton - exported for motion component consistency */
export const SkeletonLoader = Skeleton;

export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3.5"
          style={{ width: i === lines - 1 ? "62%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-5",
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-4 h-3 w-full" />
      <Skeleton className="mt-2.5 h-3 w-4/5" />
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    </div>
  );
}
