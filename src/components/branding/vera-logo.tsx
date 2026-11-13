import Link from "next/link";
import { cn } from "@/lib/utils";
import { VeraMark } from "./vera-mark";

type LogoTone = "brand" | "mono" | "inverse";

export interface VeraLogoProps {
  /** `horizontal` = mark + wordmark, `icon` = mark only, `wordmark` = text only. */
  layout?: "horizontal" | "icon" | "wordmark";
  /** Visual size preset. */
  size?: "sm" | "md" | "lg" | "xl";
  tone?: LogoTone;
  /** Renders an anchor to `/` unless `href` is overridden. Pass `null` for non-linked usage. */
  href?: string | null;
  className?: string;
  /** Accessible label override; defaults to "VERA home". */
  label?: string;
}

const SIZES = {
  sm: { mark: "h-6 w-6", text: "text-base" },
  md: { mark: "h-7 w-7", text: "text-lg" },
  lg: { mark: "h-9 w-9", text: "text-xl" },
  xl: { mark: "h-12 w-12", text: "text-2xl" },
} as const;

const TONE_CLASS: Record<LogoTone, string> = {
  brand: "text-[var(--foreground)]",
  mono: "text-[var(--foreground)]",
  inverse: "text-white",
};

/**
 * VERA logo. The wordmark uses the app sans font with tight tracking so it
 * stays crisp at every size and requires no image asset.
 */
export function VeraLogo({
  layout = "horizontal",
  size = "md",
  tone = "brand",
  href = "/",
  className,
  label = "VERA home",
}: VeraLogoProps) {
  const sizes = SIZES[size];

  const mark = <VeraMark className={sizes.mark} variant={tone === "inverse" ? "inverse" : "brand"} />;

  const wordmark = (
    <span
      aria-hidden="true"
      className={cn(
        "font-semibold tracking-[-0.04em] leading-none select-none",
        sizes.text,
        TONE_CLASS[tone],
      )}
    >
      VERA
    </span>
  );

  const content =
    layout === "icon" ? (
      <span aria-hidden="true">{mark}</span>
    ) : layout === "wordmark" ? (
      wordmark
    ) : (
      <span aria-hidden="true" className="flex items-center gap-2.5">
        {mark}
        {wordmark}
      </span>
    );

  if (href === null) {
    return (
      <span className={cn("inline-flex items-center", className)} aria-label={label}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "inline-flex items-center rounded-sm transition-opacity duration-150 hover:opacity-85 focus-ring",
        className,
      )}
    >
      {content}
    </Link>
  );
}
