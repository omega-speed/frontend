import type { ReactNode } from "react";
import { LegalFooter } from "@/components/molecules/legal-footer";

// Wraps every auth screen with a pinned legal footer bar — solid background so the
// links stay legible over the form grid and visual panel.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {/* <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-border bg-background px-4 py-2.5">
        <LegalFooter />
      </div> */}
    </>
  );
}
