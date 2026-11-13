"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { CommandPalette, useCommandPaletteShortcut } from "./command-palette";
import { PageTransition } from "@/components/motion/page-transition";

/**
 * Shell for every `/app/*` route: sticky topbar, collapsible sidebar on
 * desktop, fixed bottom bar on mobile, plus the ⌘K command palette.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const openCommand = React.useCallback(() => setCommandOpen(true), []);
  const toggleMenu = React.useCallback(() => setMenuOpen((open) => !open), []);

  useCommandPaletteShortcut(openCommand);

  return (
    <div className="flex min-h-dvh flex-col">
      <Topbar onOpenCommand={openCommand} onOpenMenu={toggleMenu} menuOpen={menuOpen} />

      <div className="flex flex-1">
        <Sidebar />

        <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-10">
          <PageTransition routeKey={pathname} className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </PageTransition>
        </main>
      </div>

      <BottomNav onOpenMenu={toggleMenu} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
