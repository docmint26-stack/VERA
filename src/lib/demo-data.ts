/**
 * Demonstration data used by Phase 1 screens.
 *
 * Everything here is clearly labelled in the UI as sample content. It exists
 * so the interface can be evaluated without a backend, and it never claims to
 * be a real record of anything.
 */

export interface DemoDocument {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  words: number;
  status: "draft" | "published";
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  { id: "doc-1", title: "Product Designer CV", category: "Resume", updatedAt: "2m ago", words: 642, status: "draft" },
  { id: "doc-2", title: "Cover letter — Northwind Labs", category: "Cover Letter", updatedAt: "1h ago", words: 318, status: "draft" },
  { id: "doc-3", title: "Research summary — LLM evaluation", category: "Research Summary", updatedAt: "Yesterday", words: 1204, status: "published" },
  { id: "doc-4", title: "Q3 project report", category: "Project Report", updatedAt: "2 days ago", words: 2871, status: "published" },
  { id: "doc-5", title: "Business proposal — Atlas rollout", category: "Business Proposal", updatedAt: "4 days ago", words: 1533, status: "draft" },
  { id: "doc-6", title: "Personal statement", category: "Personal Statement", updatedAt: "Last week", words: 489, status: "draft" },
];

export interface DemoFile {
  id: string;
  name: string;
  kind: "pdf" | "image" | "doc" | "sheet" | "archive";
  size: string;
  folder: string;
  updatedAt: string;
}

export const DEMO_FILES: DemoFile[] = [
  { id: "f-1", name: "transcript-2025.pdf", kind: "pdf", size: "1.4 MB", folder: "Credentials", updatedAt: "Today" },
  { id: "f-2", name: "certificate-ux-basics.png", kind: "image", size: "820 KB", folder: "Credentials", updatedAt: "Today" },
  { id: "f-3", name: "portfolio-screens.zip", kind: "archive", size: "12.8 MB", folder: "Work", updatedAt: "Yesterday" },
  { id: "f-4", name: "budget-model.xlsx", kind: "sheet", size: "96 KB", folder: "Work", updatedAt: "3 days ago" },
  { id: "f-5", name: "recommendation-letter.pdf", kind: "pdf", size: "240 KB", folder: "Credentials", updatedAt: "Last week" },
  { id: "f-6", name: "team-photo.jpg", kind: "image", size: "3.1 MB", folder: "Personal", updatedAt: "Last week" },
  { id: "f-7", name: "meeting-notes.docx", kind: "doc", size: "48 KB", folder: "Work", updatedAt: "2 weeks ago" },
];

export type DemoVerificationStatus =
  | "submitted"
  | "aiAssessed"
  | "sourceCorroborated"
  | "issuerVerified"
  | "rejected"
  | "revoked"
  | "expired";

export interface DemoAchievement {
  id: string;
  title: string;
  type: string;
  issuer: string;
  date: string;
  status: DemoVerificationStatus;
  evidence: number;
}

export const DEMO_ACHIEVEMENTS: DemoAchievement[] = [
  {
    id: "a-1",
    title: "BSc Human-Computer Interaction",
    type: "Qualification",
    issuer: "Northfield University",
    date: "Jun 2024",
    status: "issuerVerified",
    evidence: 3,
  },
  {
    id: "a-2",
    title: "Design system migration",
    type: "Project",
    issuer: "Atlas Studio",
    date: "Mar 2025",
    status: "sourceCorroborated",
    evidence: 2,
  },
  {
    id: "a-3",
    title: "Interaction design certificate",
    type: "Training",
    issuer: "Interaction Design Foundation",
    date: "Nov 2024",
    status: "aiAssessed",
    evidence: 1,
  },
  {
    id: "a-4",
    title: "Published — evaluating retrieval quality",
    type: "Publication",
    issuer: "Journal of Applied ML",
    date: "Aug 2025",
    status: "submitted",
    evidence: 2,
  },
  {
    id: "a-5",
    title: "Hackathon finalist — climate track",
    type: "Award",
    issuer: "GreenTech Week",
    date: "Feb 2025",
    status: "rejected",
    evidence: 0,
  },
  {
    id: "a-6",
    title: "Freelance brand refresh",
    type: "Work experience",
    issuer: "Independent",
    date: "2023 — 2024",
    status: "revoked",
    evidence: 1,
  },
];

export interface DemoActivity {
  id: string;
  title: string;
  meta: string;
  time: string;
}

export const DEMO_ACTIVITY: DemoActivity[] = [
  { id: "act-1", title: "Achievement submitted for assessment", meta: "Published — evaluating retrieval quality", time: "12 minutes ago" },
  { id: "act-2", title: "Document autosaved", meta: "Product Designer CV", time: "1 hour ago" },
  { id: "act-3", title: "Credential verified by issuer", meta: "BSc Human-Computer Interaction", time: "Yesterday" },
  { id: "act-4", title: "File added to vault", meta: "certificate-ux-basics.png", time: "Yesterday" },
  { id: "act-5", title: "Points earned", meta: "+25 for completing your profile", time: "2 days ago" },
];

export interface DemoReward {
  id: string;
  label: string;
  points: number;
  kind: "earned" | "redeemed" | "pending";
  date: string;
}

export const DEMO_REWARDS: DemoReward[] = [
  { id: "r-1", label: "Complete your profile", points: 25, kind: "earned", date: "2 days ago" },
  { id: "r-2", label: "Submit an achievement", points: 40, kind: "earned", date: "Yesterday" },
  { id: "r-3", label: "Get a credential verified", points: 100, kind: "pending", date: "Awaiting issuer" },
  { id: "r-4", label: "Featured profile placement", points: 250, kind: "redeemed", date: "Last week" },
  { id: "r-5", label: "Invite someone to VERA", points: 60, kind: "earned", date: "Last week" },
];

export const REWARDS_BALANCE = 485;

export type OpportunityKind = "jobs" | "internships" | "freelance" | "scholarships" | "training" | "collaborations";

export interface DemoOpportunity {
  id: string;
  title: string;
  organisation: string;
  kind: OpportunityKind;
  location: string;
  remote: boolean;
  deadline: string;
  summary: string;
  match: number;
}

export const DEMO_OPPORTUNITIES: DemoOpportunity[] = [
  {
    id: "o-1",
    title: "Product Designer",
    organisation: "Northwind Labs",
    kind: "jobs",
    location: "Dhaka, BD",
    remote: true,
    deadline: "18 Dec 2026",
    summary: "Own the end-to-end design of a verification-first product used by learners and employers.",
    match: 94,
  },
  {
    id: "o-2",
    title: "UX Research Internship",
    organisation: "Fieldnote",
    kind: "internships",
    location: "Remote",
    remote: true,
    deadline: "5 Jan 2027",
    summary: "Six-month placement running studies on trust signals in credential sharing.",
    match: 88,
  },
  {
    id: "o-3",
    title: "Design system clean-up",
    organisation: "Atlas Studio",
    kind: "freelance",
    location: "Remote",
    remote: true,
    deadline: "Rolling",
    summary: "Migrate 40 components to a token-driven system. Two-week engagement.",
    match: 81,
  },
  {
    id: "o-4",
    title: "Climate tech scholarship",
    organisation: "GreenTech Week",
    kind: "scholarships",
    location: "Kuala Lumpur",
    remote: false,
    deadline: "28 Feb 2027",
    summary: "Full tuition for a twelve-week programme in sustainable product design.",
    match: 73,
  },
  {
    id: "o-5",
    title: "Accessible interfaces workshop",
    organisation: "Inclusive Web",
    kind: "training",
    location: "Online",
    remote: true,
    deadline: "10 Dec 2026",
    summary: "Three-day practical workshop ending with a assessed accessibility audit.",
    match: 69,
  },
  {
    id: "o-6",
    title: "Open-source documentation",
    organisation: "CredKit",
    kind: "collaborations",
    location: "Remote",
    remote: true,
    deadline: "Rolling",
    summary: "Help document an open credential library. Good first contribution track.",
    match: 66,
  },
];

export interface DemoPassportEntry {
  id: string;
  period: string;
  title: string;
  org: string;
  detail: string;
}

export const DEMO_EXPERIENCE: DemoPassportEntry[] = [
  {
    id: "e-1",
    period: "2024 — Present",
    title: "Product Designer",
    org: "Atlas Studio",
    detail: "Led the migration of the shared design system across four product teams.",
  },
  {
    id: "e-2",
    period: "2022 — 2024",
    title: "UX Designer",
    org: "Fieldnote",
    detail: "Ran moderated research for a mobile onboarding flow used by 80k people.",
  },
  {
    id: "e-3",
    period: "2021 — 2022",
    title: "Design intern",
    org: "Northwind Labs",
    detail: "Produced interaction specs and prototypes for the verification wizard.",
  },
];

export const DEMO_EDUCATION: DemoPassportEntry[] = [
  {
    id: "ed-1",
    period: "2020 — 2024",
    title: "BSc Human-Computer Interaction",
    org: "Northfield University",
    detail: "First class. Thesis on comprehension of verification status labels.",
  },
  {
    id: "ed-2",
    period: "2024",
    title: "Interaction Design Certificate",
    org: "Interaction Design Foundation",
    detail: "120 hours covering accessibility, research methods and prototyping.",
  },
];

export const DEMO_PROJECTS: DemoPassportEntry[] = [
  {
    id: "p-1",
    period: "2025",
    title: "Verifiable portfolio",
    org: "Personal",
    detail: "A static site that renders signed achievement records from a public key.",
  },
  {
    id: "p-2",
    period: "2024",
    title: "Fieldnote onboarding redesign",
    org: "Fieldnote",
    detail: "Reduced first-session drop-off by restructuring the permission flow.",
  },
];

export const DEMO_SKILLS = [
  "Interaction design",
  "Design systems",
  "User research",
  "Prototyping",
  "Accessibility",
  "Figma",
  "HTML/CSS",
  "Data-informed design",
];

export const DEMO_CERTIFICATIONS = [
  { id: "c-1", name: "Interaction Design Certificate", issuer: "IDF", date: "2024", status: "issuerVerified" as const },
  { id: "c-2", name: "Accessibility fundamentals", issuer: "Deque University", date: "2025", status: "aiAssessed" as const },
  { id: "c-3", name: "Research operations", issuer: "Fieldnote Academy", date: "2025", status: "submitted" as const },
];

export const DEMO_RESEARCH = [
  { id: "res-1", title: "Evaluating retrieval quality in small corpora", venue: "Journal of Applied ML", date: "Aug 2025" },
  { id: "res-2", title: "How people read verification labels", venue: "CHI Extended Abstracts", date: "Apr 2024" },
];
