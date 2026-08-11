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
export function OlliePanel({
  refreshKey,
  refreshing = false,
}: {
  refreshKey: number;
  refreshing?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("shortlist");
  // Keep-alive tabs: a tab MOUNTS the first time it's opened and then stays
  // mounted (hidden) — switching back is instant, no refetch. Data still
  // refreshes when `refreshKey` changes (a real profile-changing turn).
  const [visited, setVisited] = useState<Set<Tab>>(
    () => new Set(["shortlist"]),
  );
  const open = (t: Tab) => {
    setTab(t);
    setVisited((v) => (v.has(t) ? v : new Set(v).add(t)));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 px-3 pt-3">
        <div className="flex justify-evenly rounded-full border border-primary/25 bg-primary/10 p-2 pt-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => open(t.key)}
              className={`relative flex-1 rounded-full p-1 text-[10px] font-black transition-[color,transform] duration-300 ${
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
