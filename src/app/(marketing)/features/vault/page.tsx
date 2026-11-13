import type { Metadata } from "next";
import Link from "next/link";
import { FolderLock, ArrowRight, Folder, Search, Star, Trash2, Upload, FileText, Image, File, Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/marketing/section";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { IntegrationPending } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: "My Vault — Secure File Management",
  description: "Organize, store, and manage your files and documents in a secure, structured vault.",
};

const FEATURES = [
  {
    icon: Folder,
    title: "Folder Structure",
    description: "Create nested folders to organize your files exactly how you want them.",
  },
  {
    icon: Search,
    title: "Powerful Search",
    description: "Find any file instantly with our fast, comprehensive search.",
  },
  {
    icon: Star,
    title: "Starred Items",
    description: "Mark important files for quick access from your favorites.",
  },
  {
    icon: Upload,
    title: "Easy Upload",
    description: "Drag and drop files or use the upload dialog. Supports multiple files at once.",
  },
  {
    icon: Eye,
    title: "Preview",
    description: "Preview images, PDFs, and text files directly in your browser.",
  },
  {
    icon: Trash2,
    title: "Trash & Recovery",
    description: "Deleted files go to trash first, so you can restore them if needed.",
  },
] as const;

const FILE_TYPES = [
  { icon: FileText, name: "Documents", ext: ".pdf, .doc, .docx" },
  { icon: Image, name: "Images", ext: ".jpg, .png, .gif, .webp" },
  { icon: File, name: "Other Files", ext: ".zip, .mp3, .mp4, etc." },
];

export default function VaultPage() {
  return (
    <>
      <Section className="pt-14 sm:pt-20">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-[var(--brand)]">
                <FolderLock className="h-7 w-7" aria-hidden="true" />
              </span>
              <h1 className="text-h1 max-w-3xl text-balance">My Vault — Secure File Management</h1>
              <p className="text-lead max-w-2xl">
                Store all your important files in one secure place. Organize with folders, search instantly, and access from anywhere.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/app/vault" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  Open My Vault <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/features" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                  All Features
                </Link>
              </div>
            </div>
          </RevealOnScroll>
          <IntegrationPending feature="Cloud Storage">
            Files are currently selected for preview from your device. Full cloud storage and backup will be available
            in Phase 2.
          </IntegrationPending>
        </div>
      </Section>

      <Section tone="soft">
        <div className="container-page">
          <SectionHeading
            eyebrow="Features"
            title="Complete file management"
            description="All the tools you need to keep your files organized and accessible."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <RevealOnScroll key={feature.title} delay={100}>
                <article className="surface-card flex flex-col gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-h4">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{feature.description}</p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <div className="container-page">
          <SectionHeading
            eyebrow="File Types"
            title="Support for all your files"
            description="Upload and preview a wide variety of file types."
          />
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {FILE_TYPES.map((type) => (
              <RevealOnScroll key={type.name} delay={200}>
                <article className="surface-card flex items-center gap-4 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <type.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="font-medium">{type.name}</h4>
                    <p className="text-[0.8125rem] text-[var(--muted-foreground)]">{type.ext}</p>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="brand" className="text-center">
        <div className="container-page">
          <RevealOnScroll>
            <div className="flex flex-col items-center gap-5">
              <h2 className="text-h2 max-w-2xl text-balance">Ready to organize your files?</h2>
              <p className="text-lead max-w-xl">
                Upload your first file and start building your digital library.
              </p>
              <Link href="/app/vault" className={buttonVariants({ variant: "primary", size: "xl" })}>
                Open My Vault <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
    </>
  );
}
