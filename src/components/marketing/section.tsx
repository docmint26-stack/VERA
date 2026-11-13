import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  id?: string;
  tone?: "default" | "soft" | "brand" | "inverted";
}) {
  const tones = {
    default: "bg-[var(--background)]",
    soft: "bg-[var(--surface)]",
    brand: "bg-[var(--brand-soft)]",
    inverted: "bg-[var(--foreground)] text-[var(--background)]",
  } as const;

  return (
    <section
      id={id}
      className={cn("scroll-mt-20 py-16 sm:py-20 md:py-24", tones[tone], className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  tone = "default",
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "start";
  className?: string;
  tone?: "default" | "inverted";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? <p className="text-overline">{eyebrow}</p> : null}
      <h2 className="text-h2 max-w-3xl text-balance">{title}</h2>
      {description ? (
        <p
          className={cn(
            "text-lead max-w-2xl text-balance",
            tone === "inverted" && "text-[var(--background)]/72",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/** Two-column section: sticky-ish copy on the left, visual on the right. */
export function SplitSection({
  eyebrow,
  title,
  description,
  children,
  reverse = false,
  id,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  reverse?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <Section id={id} className={className}>
      <div className="container-page">
        <div
          className={cn(
            "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <div className="flex flex-col gap-4">
            {eyebrow ? <p className="text-overline">{eyebrow}</p> : null}
            <h2 className="text-h2 text-balance">{title}</h2>
            {description ? <p className="text-lead">{description}</p> : null}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </Section>
  );
}

export function StatRow({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-[var(--background)] px-5 py-6 text-center">
          <dt className="sr-only">{item.label}</dt>
          <dd>
            <span className="block text-h3 font-semibold tabular-nums text-[var(--foreground)]">
              {item.value}
            </span>
            <span className="mt-1 block text-caption">{item.label}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
