import {
  LayoutDashboard,
  Sparkles,
  FileText,
  FolderLock,
  BadgeCheck,
  Award,
  ShieldCheck,
  Coins,
  Compass,
  Settings,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  labelKey: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar. */
  primary?: boolean;
  /** Excluded from the mobile "More" sheet. */
  shortcut?: boolean;
}

export const WORKSPACE_NAV: NavItem[] = [
  { labelKey: "nav.home", href: "/app", icon: LayoutDashboard, primary: true },
  { labelKey: "nav.ai", href: "/app/ai", icon: Sparkles, primary: true },
  { labelKey: "nav.documents", href: "/app/documents", icon: FileText, primary: true },
  { labelKey: "nav.vault", href: "/app/vault", icon: FolderLock },
  { labelKey: "nav.passport", href: "/app/passport", icon: BadgeCheck, primary: true },
  { labelKey: "nav.achievements", href: "/app/achievements", icon: Award },
  { labelKey: "nav.verification", href: "/app/verification", icon: ShieldCheck },
  { labelKey: "nav.rewards", href: "/app/rewards", icon: Coins },
  { labelKey: "nav.opportunities", href: "/app/opportunities", icon: Compass },
];

export const UTILITY_NAV: NavItem[] = [
  { labelKey: "nav.settings", href: "/app/settings", icon: Settings },
  { labelKey: "nav.help", href: "/app/help", icon: LifeBuoy },
];

export function isActivePath(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}
