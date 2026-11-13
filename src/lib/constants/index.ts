/**
 * Central VERA design constants.
 * Components must consume tokens, not hardcode values.
 */

export const COLORS = {
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surfaceElevated: "#F3F5F9",
  foreground: "#111827",
  mutedForeground: "#64748B",
  brand: "#635BFF",
  brandHover: "#5148E8",
  brandSoft: "#F0EEFF",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  border: "#E5E7EB",
} as const;

export const RADII = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Motion durations in milliseconds (see docs/design/VERA_MOTION_SYSTEM.md). */
export const DURATION = {
  micro: 150,
  fast: 220,
  normal: 280,
  panel: 340,
  entrance: 480,
} as const;

/** Shared easing curves. */
export const EASE = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
};

export const LAYOUT = {
  headerHeight: 64,
  sidebarWidth: 248,
  sidebarCollapsed: 68,
  containerMax: 1200,
  bottomNavHeight: 62,
} as const;

/** Breakpoints mirrored from Tailwind for JS-side responsive logic. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export const STORAGE_KEYS = {
  theme: "vera-theme",
  themeMotion: "vera-motion",
  locale: "vera-locale",
  sidebar: "vera-sidebar-collapsed",
  onboarding: "vera-onboarding-draft",
  onboardingComplete: "vera-onboarding-complete",
  splashSeen: "vera-splash-seen",
  dashboardHelp: "vera-dashboard-help-dismissed",
  documents: "vera-local-documents",
  vault: "vera-local-vault",
  bookmarks: "vera-opportunity-bookmarks",
  notifications: "vera-notifications-read",
  passport: "vera-passport-profile",
  rewards: "vera-rewards-demo",
} as const;

export const SITE = {
  name: "VERA",
  /** Bumped at release time — avoids `new Date()` during prerender. */
  copyrightYear: 2026,
  fullName: "Verifiable Reputation & Achievement Network",
  tagline: "Your Life. Your Work. Your Proof.",
  supportingTagline: "Ask. Create. Prove.",
  description:
    "VERA is an AI-powered personal workspace and verifiable trust network. Create with AI, organize what matters, prove your achievements, and build a reputation you can take anywhere.",
  url: "https://vera.example",
  keywords: [
    "VERA",
    "verifiable reputation",
    "achievements",
    "digital credentials",
    "AI workspace",
    "document studio",
    "professional portfolio",
    "verification network",
    "proof of work",
    "personal knowledge vault",
  ],
} as const;
