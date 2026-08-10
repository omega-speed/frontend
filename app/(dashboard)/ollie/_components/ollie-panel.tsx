"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { OllieShortlist } from "./ollie-shortlist";
import { OllieFunding } from "./ollie-funding";
import { OllieJourney } from "./ollie-journey";
import { OllieAbout } from "./ollie-about";
import { OllieApplications } from "./ollie-applications";

type Tab = "shortlist" | "applications" | "plan" | "funding" | "about";
const TABS: { key: Tab; label: string }[] = [
  { key: "shortlist", label: "Shortlist" },
  { key: "applications", label: "Applications" },
  { key: "plan", label: "Plan" },
  { key: "funding", label: "Funding" },
  { key: "about", label: "About you" },
];

// The right-hand panel: the live shortlist, the money, and "About you".
// All refetch when `refreshKey` changes (after each profile-changing turn).
export function OlliePanel({ refreshKey, refreshing = false }: { refreshKey: number; refreshing?: boolean }) {
  const [tab, setTab] = useState<Tab>("shortlist");
  // Keep-alive tabs: a tab MOUNTS the first time it's opened and then stays
  // mounted (hidden) — switching back is instant, no refetch. Data still
  // refreshes when `refreshKey` changes (a real profile-changing turn).
  const [visited, setVisited] = useState<Set<Tab>>(() => new Set(["shortlist"]));
  const open = (t: Tab) => {
    setTab(t);
    setVisited((v) => (v.has(t) ? v : new Set(v).add(t)));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-3 pt-3">
        <div className="flex rounded-full bg-muted p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => open(t.key)}
              className={`relative flex-1 rounded-full px-2 py-1.5 text-[11px] font-black uppercase transition-colors duration-200 ${
                tab === t.key ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="ollie-panel-tab"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-primary shadow-sm"
                  aria-hidden
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <div hidden={tab !== "shortlist"} className="h-full">
          <OllieShortlist refreshKey={refreshKey} refreshing={refreshing} />
        </div>
        {visited.has("applications") && (
          <div hidden={tab !== "applications"} className="h-full">
            <OllieApplications refreshKey={refreshKey} />
          </div>
        )}
        {visited.has("plan") && (
          <div hidden={tab !== "plan"} className="h-full">
            <OllieJourney refreshKey={refreshKey} refreshing={refreshing} />
          </div>
        )}
        {visited.has("funding") && (
          <div hidden={tab !== "funding"} className="h-full">
            <OllieFunding refreshKey={refreshKey} refreshing={refreshing} />
          </div>
        )}
        {visited.has("about") && (
          <div hidden={tab !== "about"} className="h-full">
            <OllieAbout refreshKey={refreshKey} />
          </div>
        )}
      </div>
    </div>
  );
}
