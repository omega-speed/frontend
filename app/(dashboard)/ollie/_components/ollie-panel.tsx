"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OllieShortlist } from "./ollie-shortlist";
import { OllieFunding } from "./ollie-funding";
import { OllieJourney } from "./ollie-journey";
import { OllieAbout } from "./ollie-about";
import { OllieApplications } from "./ollie-applications";

type Tab = "shortlist" | "applications" | "plan" | "funding" | "about";
const TABS: { key: Tab; label: string }[] = [
  { key: "about", label: "About you" },
  { key: "shortlist", label: "Shortlist" },
  { key: "applications", label: "Applications" },
  { key: "funding", label: "Funding" },
  { key: "plan", label: "Plan" },
];

// The right-hand panel: the live shortlist, the money, and "About you".
// All refetch when `refreshKey` changes (after each profile-changing turn).
const isTab = (t: string | undefined): t is Tab => TABS.some((x) => x.key === t);

export function OlliePanel({
  refreshKey,
  refreshing = false,
  initialTab,
  tabRequest,
  justUpdated = false,
}: {
  refreshKey: number;
  refreshing?: boolean;
  initialTab?: string;
  // v3 artifact moment: chat cards jump the panel to a tab.
  tabRequest?: { tab: string; n: number } | null;
  justUpdated?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(isTab(initialTab) ? initialTab : "shortlist");
  // Keep-alive tabs: a tab MOUNTS the first time it's opened and then stays
  // mounted (hidden) — switching back is instant, no refetch. Data still
  // refreshes when `refreshKey` changes (a real profile-changing turn).
  const [visited, setVisited] = useState<Set<Tab>>(
    () => new Set<Tab>(["shortlist", ...(isTab(initialTab) ? ([initialTab] as Tab[]) : [])]),
  );
  const open = (t: Tab) => {
    setTab(t);
    setVisited((v) => (v.has(t) ? v : new Set(v).add(t)));
  };

  // A chat artifact card asked for a tab (n increments so repeat taps re-fire).
  useEffect(() => {
    if (tabRequest && isTab(tabRequest.tab)) open(tabRequest.tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabRequest?.n]);

  return (
    <div className={`flex h-full flex-col transition-shadow duration-500 ${justUpdated ? "shadow-[inset_3px_0_0_var(--gold)]" : ""}`}>
      {justUpdated && (
        <p className="shrink-0 bg-gold/10 px-4 py-1 text-center text-[10px] font-black uppercase text-gold">
          Just updated
        </p>
      )}
      <div className="shrink-0 px-3 pt-3">
        <div className="flex justify-evenly rounded-full border border-primary/25 bg-primary/10 p-2 pt-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => open(t.key)}
              className={`press relative flex-1 rounded-full p-1 text-[10px] font-black transition-[color,transform] duration-300 ${
                tab === t.key
                  ? "scale-[1.04] text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="ollie-panel-tab"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.7,
                  }}
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
        <div
          hidden={tab !== "shortlist"}
          data-active={tab === "shortlist"}
          className="panel-pane h-full"
        >
          <OllieShortlist refreshKey={refreshKey} refreshing={refreshing} />
        </div>
        {visited.has("applications") && (
          <div
            hidden={tab !== "applications"}
            data-active={tab === "applications"}
            className="panel-pane h-full"
          >
            <OllieApplications refreshKey={refreshKey} />
          </div>
        )}
        {visited.has("plan") && (
          <div
            hidden={tab !== "plan"}
            data-active={tab === "plan"}
            className="panel-pane h-full"
          >
            <OllieJourney refreshKey={refreshKey} refreshing={refreshing} />
          </div>
        )}
        {visited.has("funding") && (
          <div
            hidden={tab !== "funding"}
            data-active={tab === "funding"}
            className="panel-pane h-full"
          >
            <OllieFunding refreshKey={refreshKey} refreshing={refreshing} />
          </div>
        )}
        {visited.has("about") && (
          <div
            hidden={tab !== "about"}
            data-active={tab === "about"}
            className="panel-pane h-full"
          >
            <OllieAbout refreshKey={refreshKey} />
          </div>
        )}
      </div>
    </div>
  );
}
