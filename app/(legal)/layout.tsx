import type { ReactNode } from "react";
import Link from "next/link";
import { LegalFooter } from "@/components/molecules/legal-footer";
import { APP_NAME } from "@/lib/config";

// Standalone shell for the public policy pages (no dashboard chrome). Reachable
// while logged out (auth footer) or logged in (profile menu).
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-svh flex flex-col"
      style={{ background: "var(--bg-deep)" }}
    >
      <header className="border-b border-border">
        <div className="w-full max-w-[720px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-[0.2em] text-foreground"
          >
            {APP_NAME}
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to app →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[720px] mx-auto px-6 py-10">
        {children}
      </main>

      <footer className="border-t border-border py-6">
        <LegalFooter />
      </footer>
    </div>
  );
}
