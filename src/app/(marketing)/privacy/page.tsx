import type { Metadata } from "next";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/marketing/section";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What VERA stores in Phase 1, what it does not collect, and how later phases will change that.",
};

const SECTIONS = [
  {
    heading: "The short version",
    body: [
      "In this Phase 1 preview there is no server. Your documents, files, profile, bookmarks, settings and onboarding choices are written to your browser's local storage and stay there.",
      "No analytics SDK, advertising tracker, third-party tag or crash reporter is loaded. The only network requests are the ones needed to serve this site and its fonts.",
    ],
  },
  {
    heading: "What we store on your device",
    body: [
      "Documents and their content, vault file metadata, your Passport profile, achievement drafts, opportunity bookmarks, notification read-state, and your theme, language and motion preferences.",
      "All of it is under your browser's control. Clearing site data for this origin removes it permanently, and there is no server copy to restore from.",
    ],
  },
  {
    heading: "What we do not collect",
    body: [
      "Passwords: there is no authentication backend, so credentials are validated in the form and then discarded — never stored.",
      "Content sent to AI: nothing is transmitted to any AI provider in Phase 1. Sample responses in the chat interface are static, labelled content.",
      "Precise location, device fingerprinting, contact lists, or any information the interface does not strictly need.",
    ],
  },
  {
    heading: "Cookies",
    body: [
      "This preview sets no cookies. Preferences are kept in local storage, which is scoped to this origin and visible to you in your browser's site settings.",
    ],
  },
  {
    heading: "When Phase 2 arrives",
    body: [
      "Real accounts, cloud storage and sharing will require processing on our servers. Before that ships, this policy will be updated to describe the data, the purpose, the retention period and how to export or delete it.",
      "The Settings → Privacy controls already expose the decisions you will be able to make: analytics opt-in, product-update email, and the AI content preference which stays off by default.",
    ],
  },
  {
    heading: "Your choices today",
    body: [
      "Do not enter anything into this preview that you would not want stored in this browser. You can erase it at any time by clearing site data, and the Settings → Your data panel explains the same thing inside the product.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page max-w-3xl">
          <SectionHeading
            align="start"
            eyebrow="Legal"
            title="Privacy policy"
            description={`Last updated for the Phase 1 preview · ${SITE.copyrightYear}`}
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page max-w-3xl">
          <div className="space-y-10">
            {SECTIONS.map((section, index) => (
              <section key={section.heading} aria-labelledby={`privacy-${index}`}>
                <h2 id={`privacy-${index}`} className="text-h3">
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
              Questions about this policy?{" "}
              <Link href="/contact" className="font-medium text-[var(--brand)] underline-offset-4 hover:underline">
                Contact us
              </Link>{" "}
              or read the{" "}
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
