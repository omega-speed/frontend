"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { CornerAccents } from "@/components/ui/corner-accents";
import { Button } from "@/components/ui/button";
import type { TrackedApplication } from "../../ollie/types";
import type { EssayListItem } from "../../essays/types";
import { enroll, markSubmitted, recordDecision, type DecisionType } from "../service";

// Stage of the season, per application — operational, never predictive.
type Stage = "PREPARING" | "READY" | "SUBMITTED" | "DECIDED" | "ENROLLED";

function stageOf(app: TrackedApplication): Stage {
  const s = app.application.status;
  if (s === "ENROLLED") return "ENROLLED";
  if (s === "DECIDED") return "DECIDED";
  if (s === "SUBMITTED" || s === "CONFIRMED") return "SUBMITTED";
  if (app.readiness?.overallState === "READY") return "READY";
  return "PREPARING";
}

const STAGE_LABEL: Record<Stage, { label: string; color: string }> = {
  PREPARING: { label: "Preparing", color: "var(--muted-foreground)" },
  READY: { label: "Ready to submit", color: "var(--win)" },
  SUBMITTED: { label: "Submitted — waiting", color: "var(--social)" },
  DECIDED: { label: "Decision in", color: "var(--gold)" },
  ENROLLED: { label: "Enrolled", color: "var(--primary)" },
};

const DECISIONS: { value: DecisionType; label: string }[] = [
  { value: "ADMITTED", label: "Admitted" },
  { value: "CONDITIONAL_ADMIT", label: "Conditional admit" },
  { value: "WAITLISTED", label: "Waitlisted" },
  { value: "DEFERRED", label: "Deferred" },
  { value: "DENIED", label: "Denied" },
];

function Section({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative border border-border bg-card"
    >
      <CornerAccents />
      <div className="border-b border-border px-5 py-3">
        <p className="text-[11px] font-black uppercase text-primary">{kicker}</p>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function ApplicationRow({ app, onChanged }: { app: TrackedApplication; onChanged: () => void }) {
  const [decision, setDecision] = useState<DecisionType | "">("");
  const [confirmEnroll, setConfirmEnroll] = useState(false);
  const [busy, startTransition] = useTransition();
  const stage = stageOf(app);
  const s = STAGE_LABEL[stage];

  const act = (fn: () => Promise<{ ok: boolean; message?: string }>) =>
    startTransition(async () => {
      await fn();
      onChanged();
    });

  return (
    <li className="border-b border-border/70 px-5 py-4 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 text-[14px] font-semibold text-foreground">
          <Link href={`/schools/${app.application.institutionId}`} className="transition-colors hover:text-primary">
            {app.school}
          </Link>
        </h3>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: s.color }}>
          <span className="size-1.5 rounded-full" style={{ background: s.color }} aria-hidden />
          {s.label}
        </span>
      </div>

      {stage === "PREPARING" && app.readiness && (
        <p className="mt-1 text-xs text-muted-foreground">
          {app.readiness.blockers[0] ?? app.readiness.warnings[0] ?? "Keep going — the checklist is in the Ollie panel."}
        </p>
      )}

      {stage === "READY" && (
        <div className="mt-2 flex items-center gap-3">
          <p className="text-xs text-muted-foreground">Submit on the school’s own portal — then tell me here.</p>
          <Button size="xs" variant="outline" loading={busy} onClick={() => act(() => markSubmitted(app.application.id))}>
            I submitted it
          </Button>
        </div>
      )}

      {stage === "SUBMITTED" && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-xs text-muted-foreground">Decision arrived?</p>
          <select
            value={decision}
            onChange={(e) => setDecision(e.target.value as DecisionType | "")}
            className="border border-border bg-background px-2 py-1 text-xs text-foreground outline-none"
          >
            <option value="">Choose…</option>
            {DECISIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <Button size="xs" variant="outline" loading={busy} disabled={!decision} onClick={() => decision && act(() => recordDecision(app.application.id, decision))}>
            Record it
          </Button>
        </div>
      )}

      {stage === "DECIDED" && !confirmEnroll && (
        <div className="mt-2 flex items-center gap-3">
          <p className="text-xs text-muted-foreground">If this is the one, commit — talk it over with your people first.</p>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setConfirmEnroll(true)}>
            Enroll here
          </Button>
        </div>
      )}

      {confirmEnroll && (
        <div className="mt-2 border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs leading-relaxed text-foreground">
            Committing to <span className="font-semibold">{app.school}</span> is the season’s big decision — it stays
            yours, and it’s recorded with your name on it. Sure?
          </p>
          <div className="mt-2 flex gap-3">
            <Button size="sm" loading={busy} onClick={() => act(() => enroll(app.application.id))} className="cta-btn">
              Yes — I’m enrolling
            </Button>
            <button type="button" onClick={() => setConfirmEnroll(false)} className="text-[11px] font-semibold uppercase text-muted-foreground">
              Not yet
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function SeniorJourney({
  initialApps,
  initialEssays,
  onReloadAction,
}: {
  initialApps: TrackedApplication[];
  initialEssays: EssayListItem[];
  onReloadAction: () => Promise<{ apps: TrackedApplication[]; essays: EssayListItem[] }>;
}) {
  const [apps, setApps] = useState(initialApps);
  const [essays, setEssays] = useState(initialEssays);
  const [, startTransition] = useTransition();

  const reload = () =>
    startTransition(async () => {
      const next = await onReloadAction();
      setApps(next.apps);
      setEssays(next.essays);
    });

  const admitted = useMemo(
    () => apps.filter((a) => a.application.status === "DECIDED" || a.application.status === "ENROLLED"),
    [apps],
  );
  const essayFixes = essays.filter((e) => e.status === "DRAFTING" || e.status === "IN_REVIEW");
  const enrolled = apps.find((a) => a.application.status === "ENROLLED");

  return (
    <div className="flex flex-col gap-5">
      {enrolled && (
        <div className="relative border border-primary/40 bg-primary/5 p-5">
          <CornerAccents />
          <p className="text-[11px] font-black uppercase text-primary">Committed</p>
          <p className="mt-1 text-sm text-foreground">
            You’re enrolling at <span className="font-semibold">{enrolled.school}</span>. What a season.
          </p>
        </div>
      )}

      <Section kicker="Applications" title="Where each school stands">
        {apps.length === 0 ? (
          <p className="px-5 py-5 text-sm text-muted-foreground">
            No trackers yet — tell{" "}
            <Link href="/ollie" className="font-semibold text-primary">
              Ollie
            </Link>{" "}
            “start my application to &lt;school&gt;”.
          </p>
        ) : (
          <ul>
            {apps.map((a) => (
              <ApplicationRow key={a.application.id} app={a} onChanged={reload} />
            ))}
          </ul>
        )}
      </Section>

      <Section kicker="Essays" title={essayFixes.length ? `${essayFixes.length} essay${essayFixes.length === 1 ? "" : "s"} still moving` : "Essays"}>
        {essays.length === 0 ? (
          <p className="px-5 py-5 text-sm text-muted-foreground">
            Nothing here yet — start in the{" "}
            <Link href="/essays" className="font-semibold text-primary">
              essay workspace
            </Link>
            .
          </p>
        ) : (
          <ul>
            {essays.slice(0, 6).map((e) => (
              <li key={e.id} className="border-b border-border/70 px-5 py-3 last:border-b-0">
                <Link href="/essays" className="text-[13px] font-semibold text-foreground transition-colors hover:text-primary">
                  {e.context ?? e.prompt.promptText.slice(0, 56)}
                </Link>
                <p className="text-[11px] text-muted-foreground">
                  {e.status.toLowerCase().replace(/_/g, " ")}
                  {e.versions[0] ? ` · v${e.versions[0].version} · ${e.versions[0].wordCount} words` : " · no draft yet"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section kicker="Decisions" title={admitted.length ? "Compare what came back" : "Decisions land here"}>
        {admitted.length === 0 ? (
          <p className="px-5 py-5 text-sm text-muted-foreground">
            When decisions arrive, record them on each school above — then compare offers side by side.
          </p>
        ) : (
          <div className="px-5 py-4">
            <p className="text-sm text-muted-foreground">
              {admitted.length} school{admitted.length === 1 ? " has" : "s have"} decided.{" "}
              <Link
                href={`/schools/compare?ids=${admitted.map((a) => a.application.institutionId).join(",")}`}
                className="font-semibold text-primary"
              >
                Compare them side by side
              </Link>{" "}
              — cost, outcomes, and fit, next to each other. Money questions live in the{" "}
              <Link href="/ollie" className="font-semibold text-primary">
                Funding tab
              </Link>
              .
            </p>
          </div>
        )}
      </Section>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Qoollege never submits or commits for you — every step above records what YOU did, with honest dates
        {" "}({dayjs().format("MMM D, YYYY")}). Estimated deadlines say so.
      </p>
    </div>
  );
}
