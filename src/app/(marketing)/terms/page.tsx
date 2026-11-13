import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing/section";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms that apply while VERA operates as a Phase 1 interface preview.",
};

const SECTIONS = [
  {
    heading: "What this preview is",
    body: [
      "VERA is currently an interface preview. It runs entirely in your browser, has no backend, and does not provide authentication, storage, AI generation, verification or payment services.",
      "Nothing you create here is a legal record, a certified credential or a service commitment.",
    ],
  },
  {
    heading: "Accounts",
    body: [
      "Signing in or creating an account in this preview exercises the form, validation and navigation flows. No credential is created, transmitted or stored, and returning later will not restore a session.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "Anything you type or upload stays on your device and remains yours. Because it never leaves your browser, we have no licence to it, no ability to review it and no obligation to preserve it.",
      "You are responsible for not entering material you are not permitted to handle.",
    ],
  },
  {
    heading: "Acceptable use",
    body: [
      "Do not attempt to probe, disrupt or reverse engineer the service; do not upload unlawful material; do not misrepresent a claim as verified when the product has labelled it otherwise.",
      "Attempting to present a self-reported item as issuer-verified defeats the purpose of the product and is grounds for termination when accounts exist.",
    ],
  },
  {
    heading: "Verification and credentials",
    body: [
      "Verification statuses describe the method that was used. “AI-Assessed” means an automated summary; “Issuer-Verified” means the issuing organisation confirmed it. No status constitutes a warranty about the underlying fact.",
      "Cryptographic and on-chain checks are not performed in Phase 1.",
    ],
  },
  {
    heading: "Rewards",
    body: [
      "VERA Points are internal participation points. They have no monetary value, cannot be transferred, sold or exchanged, and confer no entitlement. The programme may be adjusted or withdrawn.",
    ],
  },
  {
    heading: "Disclaimers and liability",
    body: [
      "The preview is provided as-is, without warranties of any kind, express or implied. To the extent permitted by law, we are not liable for losses arising from reliance on demonstration data or from loss of locally stored content.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "These terms will be updated before any paid or server-backed capability ships. Continuing to use the product after an update means accepting the revised terms.",
    ],
  },
  {
    heading: "Contact",
    body: ["For questions about these terms, use the contact page and choose the appropriate topic."],
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page max-w-3xl">
          <SectionHeading
            align="start"
            eyebrow="Legal"
            title="Terms of use"
            description={`Applies to the Phase 1 preview · ${SITE.copyrightYear}`}
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page max-w-3xl">
          <div className="space-y-10">
            {SECTIONS.map((section, index) => (
              <section key={section.heading} aria-labelledby={`terms-${index}`}>
                <h2 id={`terms-${index}`} className="text-h3">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-relaxed text-[var(--muted-foreground)]">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
              See also our{" "}
              <Link href="/privacy" className="font-medium text-[var(--brand)] underline-offset-4 hover:underline">
                privacy policy
              </Link>{" "}
              and the{" "}
              <Link href="/faq" className="font-medium text-[var(--brand)] underline-offset-4 hover:underline">
                FAQ
              </Link>
              .
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
