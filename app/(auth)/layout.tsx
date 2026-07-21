import type { ReactNode } from "react";
import { BrandPanel } from "./_components/brand-panel";

// Shared shell for every auth screen: the cobalt brand side on the left, the
// active form centered on the right. Individual pages render only their form.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh w-full bg-background">
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        {children}
      </div>
    </main>
  );
}
