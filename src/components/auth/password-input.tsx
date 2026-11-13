"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useT } from "@/components/i18n/language-provider";
import { cn } from "@/lib/utils";

export type PasswordInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/** Password input with a show/hide toggle that keeps the value intact. */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    const t = useT();
    const label = visible ? t("auth.hidePassword") : t("auth.showPassword");

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={label}
          aria-pressed={visible}
          title={label}
          className="absolute right-1 top-1/2 flex h-8 w-9 -translate-y-1/2 items-center justify-center rounded-[6px] text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] focus-ring"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export const PASSWORD_RULES = [
  { id: "length", label: "ruleLength", test: (v: string) => v.length >= 10 },
  { id: "case", label: "ruleCase", test: (v: string) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: "number", label: "ruleNumber", test: (v: string) => /\d/.test(v) },
] as const;

export type PasswordRuleId = (typeof PASSWORD_RULES)[number]["id"];

/** Live checklist of password requirements. */
export function PasswordRules({ value, className }: { value: string; className?: string }) {
  const t = useT();

  return (
    <ul className={cn("space-y-1", className)}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-[0.75rem] transition-colors duration-150",
              ok ? "text-[var(--success)]" : "text-[var(--subtle-foreground)]",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex h-3 w-3 items-center justify-center rounded-full border text-[0.5rem] leading-none",
                ok
                  ? "border-[var(--success)] bg-[var(--success)] text-white"
                  : "border-[var(--border-strong)]",
              )}
            >
              {ok ? "✓" : ""}
            </span>
            <span className="sr-only">{ok ? "✓ " : ""}</span>
            {t(`auth.${rule.label}`)}
          </li>
        );
      })}
    </ul>
  );
}

export function passwordMeetsRules(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}
