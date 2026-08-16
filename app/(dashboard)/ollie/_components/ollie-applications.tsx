"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { getApplications, syncApplication, updateRequirement } from "../service";
import type { ApplicationRequirementRow, TrackedApplication } from "../types";
import { PanelEmpty, PanelListSkeleton } from "./panel-bits";

// Readiness state → quiet colour cue, same language as the other tabs.
// Operational truth only — never a chance of admission (QADMIT-READY-000009).
const STATE: Record<string, { label: string; color: string }> = {
  READY: { label: "Ready to submit", color: "var(--win)" },
  ON_TRACK: { label: "On track", color: "var(--social)" },
  AT_RISK: { label: "Needs attention", color: "var(--gold)" },
  BLOCKED: { label: "Blocked", color: "var(--loss)" },
  SUBMITTED: { label: "Submitted", color: "var(--primary)" },
  INSUFFICIENT_DATA: { label: "Not enough info yet", color: "var(--muted-foreground)" },
};

const REQ_DONE = new Set(["COMPLETE", "WAIVED", "NOT_APPLICABLE"]);

function deadlineLine(app: TrackedApplication): string | null {
  const upcoming = [...app.application.deadlines]
    .filter((d) => dayjs(d.dueAt).isAfter(dayjs()))
    .sort((a, b) => dayjs(a.dueAt).valueOf() - dayjs(b.dueAt).valueOf())[0] ?? app.application.deadlines[0];
  if (!upcoming) return null;
  const d = dayjs(upcoming.dueAt);
  return `${upcoming.deadlineType.replace(/_/g, " ")} · ${d.format("MMM D, YYYY")} · ${d.fromNow()}${upcoming.estimated ? " · estimated — verify with the school" : ""}`;
}

function Row({
  app,
  index,
  onSync,
  onRequirement,
}: {
  app: TrackedApplication;
  index: number;
  onSync: (id: string) => void;
  onRequirement: (appId: string, r: ApplicationRequirementRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const readiness = app.readiness;
  const s = STATE[readiness?.overallState ?? "INSUFFICIENT_DATA"] ?? STATE.INSUFFICIENT_DATA;
  const reqs = app.application.requirements;
  const done = reqs.filter((r) => REQ_DONE.has(r.status)).length;
  const deadline = deadlineLine(app);

  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="border-b border-border/70 px-5 py-4 last:border-b-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 text-[15px] font-semibold leading-snug text-foreground">
          <Link href={`/schools/${app.application.institutionId}`} className="transition-colors hover:text-primary">
            {app.school}
          </Link>
        </h3>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: s.color }}>
          <span className="size-1.5 rounded-full" style={{ background: s.color }} aria-hidden />
          {s.label}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {app.application.round ? `${app.application.round.replace(/_/g, " ")} · ` : ""}
        {app.application.cycle}
        {reqs.length > 0 ? ` · checklist ${done}/${reqs.length}` : " · no checklist yet"}
      </p>
      {deadline && <p className="mt-0.5 text-xs text-muted-foreground">{deadline}</p>}

      {readiness && (readiness.blockers.length > 0 || readiness.warnings.length > 0 || reqs.length > 0) && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground"
          >
            {open ? "Hide details" : "What's left"}
          </button>
          {open && (
            <div className="mt-2 flex flex-col gap-1.5">
              {readiness.blockers.map((b) => (
                <p key={b} className="text-xs leading-relaxed" style={{ color: "var(--loss)" }}>
                  {b}
                </p>
              ))}
              {readiness.warnings.map((w) => (
                <p key={w} className="text-xs leading-relaxed text-muted-foreground">
                  {w}
                </p>
              ))}
              {reqs.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  title="Tap to update your progress"
                  onClick={() => onRequirement(app.application.id, r)}
                  className="self-start text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className={REQ_DONE.has(r.status) ? "text-win" : r.status === "UNKNOWN" ? "" : "text-foreground"}>
                    {REQ_DONE.has(r.status) ? "✓" : "•"}
                  </span>{" "}
                  {r.requirementType.replace(/_/g, " ")}
                  {r.mandatory ? "" : " (optional)"} — {r.status.toLowerCase().replace(/_/g, " ")}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onSync(app.application.id)}
                className="mt-1 self-start text-[11px] font-semibold uppercase text-primary transition-opacity hover:opacity-80"
              >
                Refresh from school data
              </button>
            </div>
          )}
        </div>
      )}
    </motion.li>
  );
}

// The Applications tab: the learner's trackers from Q-Admit — status, honest
// deadlines (estimates labeled), and the real checklist. Starting one happens
// in conversation: “start my application to <school>”.
export function OllieApplications({ refreshKey }: { refreshKey: number }) {
  const [apps, setApps] = useState<TrackedApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = () => {
    startTransition(async () => {
      const res = await getApplications();
      if (res.ok) {
        setApps(res.applications);
        setError(null);
      } else {
        setError(res.message);
      }
    });
  };

   
  useEffect(load, [refreshKey]);

  const onSync = (id: string) => {
    startTransition(async () => {
      await syncApplication(id);
      load();
    });
  };

  // Tap a requirement to record YOUR progress: not started → in progress →
  // complete → back. The write supersedes, never overwrites — history kept.
  const onRequirement = (appId: string, r: ApplicationRequirementRow) => {
    const next = r.status === "COMPLETE" ? "NOT_STARTED" : r.status === "IN_PROGRESS" ? "COMPLETE" : "IN_PROGRESS";
    startTransition(async () => {
      await updateRequirement(
        appId,
        { requirementKey: r.requirementKey, requirementType: r.requirementType, mandatory: r.mandatory },
        next,
      );
      load();
    });
  };

  if (error) return <p className="px-5 py-6 text-sm text-muted-foreground">{error}</p>;
  if (apps === null) return <PanelListSkeleton rows={3} />;
  if (apps.length === 0) {
    return (
      <PanelEmpty
        title="No applications tracked yet"
        body="When you start one, the checklist builds itself from what the school actually requires — deadlines, requirements, and what's left."
        hint="start my application to NYU"
      />
    );
  }

  return (
    <div>
      <ul>
        {apps.map((a, i) => (
          <Row key={a.application.id} app={a} index={i} onSync={onSync} onRequirement={onRequirement} />
        ))}
      </ul>
      <p className="px-5 py-3 text-[11px] leading-relaxed text-muted-foreground">
        Submitting is always your action — nothing here submits for you.
      </p>
    </div>
  );
}
