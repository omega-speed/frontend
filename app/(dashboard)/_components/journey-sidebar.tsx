"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// The single navigation: a dark, Claude-style sidebar. One nav, not three —
// journey destinations with live progress badges, and the student anchored at
// the bottom. Panel tabs (Shortlist/Applications/Funding) deep-link into the
// Ollie workspace via ?panel=.
const JOURNEY: { label: string; href: string; panel?: string; badgeKey?: "shortlist" | "funding" }[] = [
  { label: "Chat with Ollie", href: "/ollie" },
  { label: "Shortlist", href: "/ollie?panel=shortlist", panel: "shortlist", badgeKey: "shortlist" },
  { label: "Applications", href: "/ollie?panel=applications", panel: "applications" },
  { label: "Funding", href: "/ollie?panel=funding", panel: "funding", badgeKey: "funding" },
  { label: "My Plan", href: "/journey" },
  { label: "Essays", href: "/essays" },
  { label: "Schools", href: "/schools" },
];

interface SegmentFlags {
  homeschool: boolean;
  ged: boolean;
  transfer: boolean;
  grad: boolean;
  global: boolean;
  athlete: boolean;
}

function NavLinks({
  badges,
  segments,
}: {
  badges: { shortlist: string | null; funding: string | null };
  segments?: SegmentFlags;
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const activePanel = params.get("panel");

  const items = [
    ...JOURNEY,
    ...(segments?.homeschool ? [{ label: "Homeschool", href: "/homeschool" }] : []),
    ...(segments?.ged ? [{ label: "GED to college", href: "/ged" }] : []),
    ...(segments?.transfer ? [{ label: "Transfer credits", href: "/transfer" }] : []),
    ...(segments?.grad ? [{ label: "Grad studies", href: "/grad" }] : []),
    ...(segments?.global ? [{ label: "International", href: "/international" }] : []),
    ...(segments?.athlete ? [{ label: "Athlete", href: "/athlete" }] : []),
  ];
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      <p className="px-2 pb-1.5 pt-4 text-[10px] font-black uppercase text-white/40">Your journey</p>
      {items.map((item) => {
        const base = item.href.split("?")[0];
        const active =
          pathname === base && (item.panel ? activePanel === item.panel : base !== "/ollie" || !activePanel);
        const badge = item.badgeKey ? badges[item.badgeKey] : null;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between rounded-full px-3 py-2 text-sm transition-colors duration-200 ${
              active ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{item.label}</span>
            {badge && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function JourneySidebar({
  userName,
  userDetail,
  badges,
  segments,
}: {
  userName: string;
  userDetail: string | null;
  badges: { shortlist: string | null; funding: string | null };
  segments?: SegmentFlags;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col text-white md:flex" style={{ background: "oklch(0.22 0.04 300)" }}>
      <Link href="/ollie" className="flex items-center gap-2.5 px-5 pb-2 pt-5">
        <span
          className="flex size-7 items-center justify-center rounded-full shadow-sm"
          style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.66 0.24 320))" }}
        >
          <span className="size-2 rounded-full bg-white/85" />
        </span>
        <span className="text-sm font-black uppercase tracking-[0.28em] text-white">Qoollege</span>
      </Link>
      <div className="px-3 pt-2">
        <Link
          href="/ollie"
          className="cta-btn block rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-[1.01]"
        >
          + Ask Ollie something
        </Link>
      </div>
      <Suspense>
        <NavLinks badges={badges} segments={segments} />
      </Suspense>
      <div className="mt-auto border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-semibold text-white">{userName}</p>
        {userDetail && <p className="truncate text-xs text-white/50">{userDetail}</p>}
      </div>
    </aside>
  );
}
