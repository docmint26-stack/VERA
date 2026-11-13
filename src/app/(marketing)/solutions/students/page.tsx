import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, ArrowRight, BookOpen, Award, Briefcase, Users, FileText, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";

export const metadata: Metadata = {
  title: "VERA for Students — Build Your Academic Portfolio",
  description: "Organize your academic journey, showcase achievements, and verify credentials to stand out from the crowd.",
};

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Organize Your Work",
    description: "Keep all your academic documents, projects, and research in one structured vault.",
  },
  {
    icon: Award,
    title: "Showcase Achievements",
    description: "Create a verifiable portfolio of your academic accomplishments, awards, and certifications.",
  },
  {
    icon: FileText,
    title: "Create with AI",
    description: "Get help drafting resumes, personal statements, and research summaries with AI assistance.",
  },
  {
    icon: Briefcase,
    title: "Prepare for Jobs",
    description: "Build a professional profile and generate application materials ready for job hunting.",
  },
  {
    icon: Star,
    title: "Earn Recognition",
    description: "Gain VERA Points for completing your profile, submitting achievements, and engaging with the platform.",
  },
  {
    icon: Users,
    title: "Collaborate",
    description: "Share documents with classmates and work on group projects together.",
  },
] as const;

const USE_CASES = [
  {
    title: "Job Applications",
    description: "Create professional resumes and cover letters that stand out to employers.",
  },
  {
    title: "Internship Applications",
    description: "Build a portfolio showcasing your skills and academic projects.",
  },
  {
    title: "Scholarship Applications",
    description: "Document your achievements and create compelling personal statements.",
  },
  {
    title: "Research Documentation",
    description: "Organize your research papers, citations, and supporting documents.",
  },
  {
    title: "Group Projects",
    description: "Collaborate with classmates, share files, and track project progress.",
  },
  {
    title: "Study Abroad Applications",
    description: "Prepare all required documents and verify your academic credentials.",
  },
];

const SUCCESS_STORIES = [
  {
    name: "Priya",
    role: "Computer Science Student",
    story: "Used VERA to create a professional portfolio that landed me a summer internship at a top tech company.",
  },
  {
    name: "Rahim",
    role: "Engineering Student",
    story: "Organized all my research papers and project documentation in VERA's vault. Now I can find anything in seconds.",
  },
  {
    name: "Aisha",
    role: "Business Student",
    story: "VERA's AI helped me write a winning business plan for my entrepreneurship class. The templates saved me hours.",
  },
];

export default function StudentsPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <GraduationCap className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">VERA for Students — Build Your Academic Portfolio</h1>
              <p className="text-lead max-w-2xl">
                As a student, you have incredible achievements. VERA helps you organize, showcase, and verify them to open doors to opportunities.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Get Started Free <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
          <SectionHeading
            eyebrow="Benefits"
            title="What VERA offers students"
            description="Tools and features designed specifically for your academic journey."
          />
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
          <SectionHeading
            eyebrow="Use Cases"
            title="How students use VERA"
            description="From applications to research, VERA supports your academic goals."
          />
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
            <div className="grid gap-6 md:grid-cols-3">
              {SUCCESS_STORIES.map((story) => (
                <article key={story.name} className="surface-card flex flex-col gap-4 p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] font-medium">
                      {story.name.charAt(0)}
                    </span>
                    <div>
                      <h4 className="font-medium">{story.name}</h4>
                      <p className="text-[0.8125rem] text-[var(--muted-foreground)]">{story.role}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{story.story}</p>
                </article>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Start building your academic future</h2>
              <p className="text-lead max-w-xl">
                Join thousands of students who use VERA to organize, showcase, and verify their achievements.
              </p>
              <Link href="/signup" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Create Your Free Account <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
