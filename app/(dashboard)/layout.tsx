import { Suspense, ReactNode } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import UserProfile from "@/components/molecules/user-profile";
import { CalmToggle } from "@/components/molecules/calm-toggle";
import { getCurrentUser } from "@/lib/auth";
import { getSegments } from "./_lib/segments";
import { JourneySidebar } from "./_components/journey-sidebar";
import { NotificationBell } from "./_components/notification-bell";
import { MotionProvider } from "@/components/motion/motion-provider";

// Every dashboard route is authenticated (reads cookies) and must render per-request.
export const dynamic = "force-dynamic";

// ONE navigation: the dark journey sidebar (desktop). Mobile keeps a slim top
// bar until the tab-bar slice lands. Content fills the rest.
export default async function layout({ children }: { children: ReactNode }) {
  // Segment nav items appear only for the learners they belong to — one quiet
  // surface more for those who need it, zero for everyone else.
  const [user, segments] = await Promise.all([getCurrentUser(), getSegments()]);
  return (
    <MotionProvider>
    <div className="flex min-h-svh bg-background">
      <JourneySidebar
        userName={user?.name || user?.email?.split("@")[0] || "Student"}
        userDetail={user?.email ?? null}
        badges={{ shortlist: null, funding: null }}
        segments={segments}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:justify-end">
          <Link href="/ollie" className="flex items-center gap-2 md:hidden">
            <span
              className="flex size-6 items-center justify-center rounded-full shadow-sm"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.66 0.24 320))" }}
            >
              <span className="size-1.5 rounded-full bg-white/85" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.24em] text-primary">Qoollege</span>
          </Link>
          <nav className="ml-4 flex items-center gap-3 text-xs md:hidden">
            <Link href="/ollie" className="text-muted-foreground hover:text-foreground">Ollie</Link>
            <Link href="/journey" className="text-muted-foreground hover:text-foreground">Plan</Link>
            <Link href="/essays" className="text-muted-foreground hover:text-foreground">Essays</Link>
            <Link href="/schools" className="text-muted-foreground hover:text-foreground">Schools</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <NotificationBell />
            <CalmToggle />
            <Suspense fallback={<Skeleton className="h-8 w-28" />}>
              <UserProfile />
            </Suspense>
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
    </MotionProvider>
  );
}
