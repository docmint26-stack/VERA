import type { Metadata } from "next";
import Link from "next/link";
import { Users, ArrowRight, GraduationCap, FileText, ShieldCheck, Network, Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "VERA for Organizations — Verify & Issue Credentials",
  description: "Issue verifiable credentials, manage verification queues, and build trust in your organization.",
};

const BENEFITS = [
  { icon: GraduationCap, title: "Credential Issuance", description: "Issue verifiable degrees, certificates, and badges with cryptographic proof." },
  { icon: ShieldCheck, title: "Verification Services", description: "Verify credentials issued by other organizations with a trusted verification process." },
  { icon: Users, title: "Member Management", description: "Manage student, alumni, and staff profiles with verified credentials." },
  { icon: FileText, title: "Audit Logs", description: "Maintain complete audit trails for all credential issuance and verification activities." },
  { icon: Network, title: "Interoperability", description: "Exchange verifiable credentials with other organizations and platforms." },
  { icon: Settings, title: "Customization", description: "Customize credential templates, verification workflows, and branding." },
];

const USE_CASES = [
  { title: "Degree Issuance", description: "Issue verifiable degrees and diplomas to graduates." },
  { title: "Certificate Programs", description: "Verify completion of certificate programs and continuing education." },
  { title: "Professional Licenses", description: "Issue and verify professional licenses and certifications." },
  { title: "Membership Verification", description: "Verify membership status and credentials for professional organizations." },
  { title: "Alumni Network", description: "Build and maintain a verified alumni network." },
  { title: "Cross-Institution", description: "Exchange and verify credentials across multiple educational institutions." },
];

const ORGANIZATION_TYPES = [
  "Universities & Colleges", "Vocational Schools", "Professional Associations",
  "Certification Bodies", "Licensing Boards", "Corporate Training",
  "Online Learning Platforms", "Non-Profit Organizations", "Government Agencies",
];

export default function OrganizationsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <Users className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA for Organizations — Verify & Issue Credentials</h1>
              <p className="text-lead max-w-2xl">
                As a credential-issuing organization, you need a secure, verifiable way to issue and manage credentials. VERA provides the infrastructure for trusted credentialing.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/contact" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Get in Touch <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/how-it-works" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  How it works
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading eyebrow="Benefits" title="Organization features" description="Tools for credential issuance and verification." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <RevealOnScroll key={benefit.title} delay={100}>
                <article className="surface-card flex flex-col gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <benefit.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-h4">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{benefit.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading eyebrow="Use Cases" title="How organizations use VERA" description="Practical applications for credential management." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASES.map((useCase) => (
              <RevealOnScroll key={useCase.title} delay={200}>
                <article className="surface-card p-6">
                  <h3 className="text-h4 mb-3">{useCase.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{useCase.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <RevealOnScroll>
            <article className="surface-card p-6">
              <h3 className="text-h4 mb-4 text-center">Organization Types</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {ORGANIZATION_TYPES.map((type) => (
                  <span key={type} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-[0.8125rem] font-medium">
                    {type}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-center text-[0.875rem] text-[var(--muted-foreground)]">
                VERA supports all types of credential-issuing organizations
              </p>
            </article>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Transform your credentialing</h2>
              <p className="text-lead max-w-xl">
                Join organizations that use VERA to issue verifiable credentials and build trust.
              </p>
              <Link href="/contact" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Get in Touch <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
