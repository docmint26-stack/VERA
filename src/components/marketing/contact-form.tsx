"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, FieldError } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { SuccessCheckmark } from "@/components/motion/success-checkmark";
import { useT } from "@/components/i18n/language-provider";

const schema = z.object({
  name: z.string().min(2, "Enter at least 2 characters"),
  email: z.email("Enter a valid email address"),
  topic: z.string().min(1, "Choose a topic"),
  message: z.string().min(10, "Tell us a little more (10 characters minimum)"),
});

type FormValues = z.infer<typeof schema>;

const TOPICS = ["Support", "Verification", "Partnership", "Press", "Other"] as const;

export function ContactForm() {
  const t = useT();
  const [submitted, setSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", topic: "", message: "" },
    mode: "onBlur",
  });

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    setSubmitted(true);
    reset();
  };

  if (submitted && isSubmitSuccessful) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <SuccessCheckmark />
        <h2 className="text-h3">{t("help.contact")}</h2>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
          Your message passed validation. Nothing was transmitted — the support inbox arrives with Phase 2.
        </p>
        <Alert variant="info" className="max-w-sm text-left">
          In the meantime, the <strong>FAQ</strong> and <strong>Help centre</strong> cover most questions.
        </Alert>
        <Button variant="secondary" onClick={() => setSubmitted(false)}>
          Write another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Send className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
        <h2 className="text-h3">{t("help.contact")}</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="contact-name">{t("auth.fullName")}</FieldLabel>
          <Input id="contact-name" autoComplete="name" placeholder="Your name" {...register("name")} />
          <FieldError id="contact-name-error">{errors.name?.message}</FieldError>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="contact-email">{t("auth.email")}</FieldLabel>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
          <FieldError id="contact-email-error">{errors.email?.message}</FieldError>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="contact-topic">Topic</FieldLabel>
        <select
          id="contact-topic"
          {...register("topic")}
          className="h-[38px] rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3 text-sm shadow-[var(--shadow-xs)] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--brand-ring)] data-[placeholder]:text-[var(--subtle-foreground)]"
        >
          <option value="">
            Choose a topic
          </option>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
        <FieldError id="contact-topic-error">{errors.topic?.message}</FieldError>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="contact-message">{t("actions.add")} — {t("common.description")}</FieldLabel>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="What were you trying to do?"
          {...register("message")}
        />
        <FieldError id="contact-message-error">{errors.message?.message}</FieldError>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting} size="lg">
          {t("help.sendMessage")}
        </Button>
        <span className="flex items-center gap-1.5 text-caption">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />
          Validated locally
        </span>
      </div>
    </form>
  );
}
