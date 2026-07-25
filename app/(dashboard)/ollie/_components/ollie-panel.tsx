"use client";

import { useState } from "react";
import { OllieShortlist } from "./ollie-shortlist";
import { OllieAbout } from "./ollie-about";

type Tab = "shortlist" | "about";

// The right-hand panel: a tab for the live shortlist and one for "About you".
// Both refetch when `refreshKey` changes (after each chat turn).
export function OlliePanel({ refreshKey }: { refreshKey: number }) {
  const [tab, setTab] = useState<Tab>("shortlist");

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 border-b border-border">
        {(["shortlist", "about"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative flex-1 px-4 py-3 text-[11px] font-black uppercase transition-colors ${
              tab === t ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "shortlist" ? "Shortlist" : "About you"}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" aria-hidden />}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {tab === "shortlist" ? <OllieShortlist refreshKey={refreshKey} /> : <OllieAbout refreshKey={refreshKey} />}
      </div>
    </div>
  );
}
