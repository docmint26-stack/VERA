import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/marketing/section";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about what works in the VERA Phase 1 preview, data storage, verification and rewards.",
};

const GROUPS = [
  {
    title: "About VERA",
    items: [
      {
        q: "What is VERA?",
        a: "VERA is an AI-powered personal workspace and verifiable trust network. It combines a chat assistant, a document studio, a file vault and a professional passport with a verification workflow that records how each claim was checked.",
      },
      {
        q: "Who is it for?",
        a: "Individuals who need their work to travel — job seekers, learners, researchers, contractors — plus organisations that issue credentials and small teams that share documents.",
      },
      {
        q: "How much does it cost?",
        a: "There is no pricing page because nothing is for sale in Phase 1. Pricing will be published before any paid capability ships.",
      },
    ],
  },
  {
    title: "This preview",
    items: [
      {
        q: "What actually works right now?",
        a: "The complete interface: marketing site, authentication screens, onboarding, dashboard, AI chat UI, documents, vault, passport, achievements, verification, rewards, opportunities, settings and help. It runs entirely in your browser.",
      },
      {
        q: "What is demonstration data?",
        a: "Rewards balances and transactions, opportunity listings, verification histories, notifications and activity feeds are labelled demo data. They are realistic samples, not real records.",
      },
      {
        q: "Is there a backend?",
        a: "No. There is no server, database, AI provider, payment processor or wallet connection. Anything that would need one is marked “awaiting integration”.",
      },
      {
        q: "What happens if I clear my browser data?",
        a: "Your documents, files, profile and settings are erased. There is no account to restore from until Phase 2 ships storage.",
      },
    ],
  },
  {
    title: "Verification & trust",
    items: [
      {
        q: "Is VERA a blockchain product?",
        a: "No. Cryptographic and on-chain checks are planned for Phase 4. Nothing in this preview has been validated on a blockchain, and the product says so wherever it matters.",
      },
      {
        q: "Can I mark something as verified myself?",
        a: "No. You can submit a claim and attach evidence, but the “Issuer-Verified” state can only be reached by the issuing organisation confirming it.",
      },
      {
        q: "What does “AI-Assessed” mean?",
        a: "An automated review summarised the evidence you supplied. It is a description of the material, not a judgement about you, and it is never presented as a human decision.",
      },
      {
        q: "Can a credential be withdrawn?",
        a: "Yes. When an issuer revokes a credential, every shared link reflects the revoked state rather than continuing to show it as valid.",
      },
    ],
  },
  {
    title: "Rewards & data",
    items: [
      {
        q: "Are VERA Points money?",
        a: "No. They are internal participation points with no monetary value, no trading, no transfer and no guaranteed benefit.",
      },
      {
        q: "Is my content used to train AI?",
        a: "Not in Phase 1 — nothing is sent to an AI provider at all. The setting exists, defaults to off, and will remain opt-in when a provider is connected.",
      },
      {
        q: "Can I export my data?",
        a: "The export control exists in Settings. Producing a real export file requires Phase 2 storage, so the control currently explains that rather than downloading an empty file.",
      },
    ],
  },
] as const;

export default function FaqPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions we would ask too"
            description="Including the ones about what this preview does not do."
          />
        </div>
      </Section>

      <Section tone="soft" className="pt-0">
        <div className="container-page space-y-12">
          {GROUPS.map((group) => (
            <div key={group.title} className="max-w-3xl">
              <h2 className="text-h3">{group.title}</h2>
              <Accordion type="multiple" className="mt-4">
                {group.items.map((item, index) => (
                  <AccordionItem key={item.q} value={`${group.title}-${index}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent>{item.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="container-page flex flex-col items-center gap-5 text-center">
          <h2 className="text-h2">Still stuck?</h2>
          <p className="text-lead max-w-lg">
            Tell us what you were trying to do and we will point you to the right place.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className={buttonVariants({ variant: "primary", size: "lg" })}>
              Contact support <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/help" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Help centre
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
