import { cn } from "@/lib/utils";

export type VeraMarkVariant = "brand" | "mono" | "inverse";

const STROKE: Record<VeraMarkVariant, string> = {
  brand: "stroke-[var(--brand)]",
  mono: "stroke-[var(--foreground)]",
  inverse: "stroke-white",
};

const NODE_FILL: Record<VeraMarkVariant, string> = {
  brand: "fill-[var(--brand)]",
  mono: "fill-[var(--foreground)]",
  inverse: "fill-white",
};

/**
 * The VERA symbol: a geometric V with three connected nodes and a
 * verification node at the convergence point. The right arm overshoots
 * the left, giving the mark a check-mark cadence.
 *
 * Geometry mirrors `scripts/generate-icons.mjs` — keep both in sync.
 * Legible from 16px to 240px.
 */
export function VeraMark({
  className,
  variant = "brand",
  animated = false,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  variant?: VeraMarkVariant;
  /** Plays the splash draw-in sequence once on mount. */
  animated?: boolean;
}) {
  const fill = NODE_FILL[variant];
  const stroke = STROKE[variant];

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
      {...props}
    >
      <g
        className={stroke}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M15 20 L26.8 42.2"
          strokeDasharray={animated ? 26 : undefined}
          strokeDashoffset={animated ? 26 : undefined}
          style={
            animated
              ? { animation: "vera-draw 480ms var(--ease-out) 60ms forwards" }
              : undefined
          }
        />
        <path
          d="M50 13 L35.9 42"
          strokeDasharray={animated ? 33 : undefined}
          strokeDashoffset={animated ? 33 : undefined}
          style={
            animated
              ? { animation: "vera-draw 520ms var(--ease-out) 220ms forwards" }
              : undefined
          }
        />
      </g>

      <circle
        cx="15"
        cy="20"
        r="5.2"
        className={fill}
        style={
          animated
            ? { animation: "fade-in 300ms var(--ease-out) 400ms both" }
            : undefined
        }
      />
      <circle
        cx="50"
        cy="13"
        r="5.2"
        className={fill}
        style={
          animated
            ? { animation: "fade-in 300ms var(--ease-out) 560ms both" }
            : undefined
        }
      />

      {/* Verification node: donut at the convergence point */}
      <path
        fillRule="evenodd"
        className={fill}
        d="M31.5 44.4 A6.6 6.6 0 1 0 31.5 57.6 A6.6 6.6 0 1 0 31.5 44.4 Z M31.5 48.2 A2.8 2.8 0 1 1 31.5 53.8 A2.8 2.8 0 1 1 31.5 48.2 Z"
        style={
          animated
            ? { animation: "fade-in 340ms var(--ease-out) 700ms both" }
            : undefined
        }
      />
    </svg>
  );
}
