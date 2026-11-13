import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { Section, SectionHeading } from "@/components/marketing/section";
import { IntegrationPending } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the VERA team about support, partnerships or verification.",
};

const CHANNELS = [
  { label: "Support", value: "support@vera.example", note: "Product questions and bug reports" },
  { label: "Verification", value: "issuers@vera.example", note: "Organisations that want to issue credentials" },
  { label: "Press", value: "press@vera.example", note: "Media and partnership enquiries" },
] as const;

export default function ContactPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Contact"
            title="Tell us what you need"
            description="The form below validates and confirms locally. Sending requires the Phase 2 support inbox."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div className="surface-card p-6 sm:p-8">
              <ContactForm />
            </div>

            <div className="flex flex-col gap-6">
              <ul className="space-y-4">
                {CHANNELS.map((channel) => (
                  <li key={channel.label} className="surface-soft px-5 py-4">
                    <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[var(--brand)]">
                      {channel.label}
                    </p>
                    <p className="mt-1.5 font-mono text-sm">{channel.value}</p>
                    <p className="mt-1 text-caption">{channel.note}</p>
                  </li>
                ))}
              </ul>

              <IntegrationPending feature="Support inbox">
                Messages are validated and acknowledged on screen, but no email is dispatched from this
                preview.
              </IntegrationPending>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
