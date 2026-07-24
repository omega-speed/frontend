import { Suspense, ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import UserProfile from "@/components/molecules/user-profile";

// Every dashboard route is authenticated (reads cookies) and must render per-request.
// Without this, `next build` tries to statically prerender them, which fails.
export const dynamic = "force-dynamic";

// The whole signed-in app is one screen: Ollie. No sidebar, no page chrome — a
// slim top bar with the wordmark and the account menu, and Ollie fills the rest.
export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
        <Link
          href="/ollie"
          className="text-sm font-black uppercase tracking-[0.28em] text-primary"
        >
          Qoollege
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Suspense fallback={<Skeleton className="h-8 w-28" />}>
            <UserProfile />
          </Suspense>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
