"use client";

import { useState } from "react";
import { OllieShortlist } from "./ollie-shortlist";
import { OllieFunding } from "./ollie-funding";
import { OllieJourney } from "./ollie-journey";
import { OllieAbout } from "./ollie-about";

type Tab = "shortlist" | "plan" | "funding" | "about";
const TABS: { key: Tab; label: string }[] = [
  { key: "shortlist", label: "Shortlist" },
  { key: "plan", label: "Plan" },
  { key: "funding", label: "Funding" },
  { key: "about", label: "About you" },
];

// The right-hand panel: the live shortlist, the money, and "About you".
// All refetch when `refreshKey` changes (after each profile-changing turn).
export function OlliePanel({ refreshKey, refreshing = false }: { refreshKey: number; refreshing?: boolean }) {
  const [tab, setTab] = useState<Tab>("shortlist");

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative flex-1 px-3 py-3 text-[11px] font-black uppercase transition-colors ${
              tab === t.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" aria-hidden />}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "shortlist" ? (
          <OllieShortlist refreshKey={refreshKey} refreshing={refreshing} />
        ) : tab === "plan" ? (
          <OllieJourney refreshKey={refreshKey} refreshing={refreshing} />
        ) : tab === "funding" ? (
          <OllieFunding refreshKey={refreshKey} refreshing={refreshing} />
        ) : (
          <OllieAbout refreshKey={refreshKey} />
        )}
      </div>
    </div>
  );
}
