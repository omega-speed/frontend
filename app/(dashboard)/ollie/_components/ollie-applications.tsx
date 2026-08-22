"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import dayjs from "dayjs";
import { commitSchool, getApplications, getTasks, recordDecision, syncApplication, updateApplicationStatus } from "../service";
import type { LearnerTask, TrackedApplication } from "../types";
import { PanelEmpty, PanelListSkeleton } from "./panel-bits";
import { TaskList } from "./task-list";

// The Applications tab in the same design language as the shortlist: card
// surfaces, the v3 requirement SEGMENT BAR (bars, not percentages), quiet
// text-link actions, and per-action loading with honest toasts. Starting one
// happens in conversation: "start my application to <school>".

// The pill shows the LEARNER's own declared status — we never dress our
// interpretation of school data up as the state of their application.
const STATE: Record<string, { label: string; color: string }> = {
  PLANNING: { label: "Planning", color: "var(--muted-foreground)" },
  IN_PROGRESS: { label: "In progress", color: "var(--social)" },
  READY: { label: "Ready", color: "var(--win)" },
  SUBMITTED: { label: "Submitted", color: "var(--primary)" },
  CONFIRMED: { label: "Submitted", color: "var(--primary)" },
  DECIDED: { label: "Decision in", color: "var(--gold)" },
  ENROLLED: { label: "Enrolled", color: "var(--win)" },
  WITHDRAWN: { label: "Not pursuing", color: "var(--muted-foreground)" },
};

const REQ_DONE = new Set(["COMPLETE", "WAIVED", "NOT_APPLICABLE"]);
const SUBMITTED_STATES = new Set(["SUBMITTED", "CONFIRMED", "DECIDED", "ENROLLED"]);

// v3 next-action strip: ONE thing, chosen for you — the closest deadline that
// still has unfinished work. No deadline on file → no invented urgency.
function nextAction(apps: TrackedApplication[]): {
  school: string;
  dueIn: string;
  estimated: boolean;
} | null {
  const candidates = apps
    .filter((a) => !SUBMITTED_STATES.has(a.application.status))
    .flatMap((a) => {
      const due = [...a.application.deadlines]
        .filter((d) => dayjs(d.dueAt).isAfter(dayjs()))
        .sort((x, y) => dayjs(x.dueAt).valueOf() - dayjs(y.dueAt).valueOf())[0];
      return due ? [{ a, due }] : [];
    })
    .sort((x, y) => dayjs(x.due.dueAt).valueOf() - dayjs(y.due.dueAt).valueOf());
  const top = candidates[0];
  if (!top) return null;
  return {
    school: top.a.school,
    dueIn: dayjs(top.due.dueAt).fromNow(),
    estimated: top.due.estimated,
  };
}

function nextDeadline(app: TrackedApplication) {
  return (
    [...app.application.deadlines]
      .filter((d) => dayjs(d.dueAt).isAfter(dayjs()))
      .sort((a, b) => dayjs(a.dueAt).valueOf() - dayjs(b.dueAt).valueOf())[0] ?? app.application.deadlines[0] ?? null
  );
}

function Row({
  app,
  index,
  onSync,
  onLifeEvent,
  onEnroll,
  syncing,
  lifeEventPending,
  openTasks,
  onTasksChanged,
}: {
  app: TrackedApplication;
  index: number;
  onSync: (id: string) => void;
  onLifeEvent: (appId: string, event: "submitted" | "withdrawn" | "admitted" | "denied" | "waitlisted") => void;
  onEnroll: (app: TrackedApplication) => void;
  syncing: boolean;
  lifeEventPending: boolean;
  openTasks: number;
  onTasksChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const s = STATE[app.application.status] ?? STATE.PLANNING;
  const due = nextDeadline(app);
  const dueSoon = due && dayjs(due.dueAt).diff(dayjs(), "day") <= 14 && dayjs(due.dueAt).isAfter(dayjs());
  const busy = syncing || lifeEventPending;
  const submitted = SUBMITTED_STATES.has(app.application.status);
  const [confirming, setConfirming] = useState<"submitted" | "withdrawn" | null>(null);
  const [heardBack, setHeardBack] = useState(false);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] } }}
      transition={{ duration: 0.28, delay: index * 0.05, layout: { type: "spring", bounce: 0, duration: 0.45 } }}
      className="list-none rounded-2xl border border-border bg-card transition-colors hover:border-primary/25"
    >
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-[15px] font-bold leading-snug text-foreground">
            <Link href={`/schools/${app.application.institutionId}`} className="transition-colors hover:text-primary">
              {app.school}
            </Link>
          </h3>
          <span
            className="relative shrink-0 overflow-hidden rounded-full px-2 py-0.5 text-[10px] font-black transition-[background-color,color] duration-300"
            style={{ color: s.color, background: `color-mix(in oklab, ${s.color} 12%, transparent)` }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={s.label}
                initial={{ opacity: 0, y: 7, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -7, filter: "blur(3px)" }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="block"
              >
                {s.label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {app.application.round
              ? `${app.application.round.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())} decision, `
              : ""}
            {app.application.cycle} intake
          </span>
          {app.schoolUrl && (
            <a
              href={app.schoolUrl.startsWith("http") ? app.schoolUrl : `https://${app.schoolUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary hover:opacity-75"
            >
              Open the school&apos;s site
              <ArrowUpRight className="ml-0.5 inline size-3 align-[-1px]" strokeWidth={2.5} aria-hidden />
            </a>
          )}
        </p>


        {due && (
          <p className={`mt-2 flex items-center gap-1.5 text-xs leading-relaxed ${dueSoon ? "text-gold" : "text-muted-foreground"}`}>
            <span>
              <span className={`font-semibold ${dueSoon ? "" : "text-foreground"}`}>
                {due.deadlineType.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase())} due {dayjs(due.dueAt).format("MMM D")}
              </span>
              , {dayjs(due.dueAt).fromNow()}
            </span>
            {due.estimated && (
              <span
                title="This date is our estimate. The school's site has the real one."
                className="rounded-full bg-muted px-1.5 py-px text-[9px] font-bold uppercase text-muted-foreground"
              >
                estimate
              </span>
            )}
          </p>
        )}

        <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
          <div className="mt-2.5 flex flex-col gap-1.5 border-t border-border/60 pt-2.5">
            <p className="text-xs leading-relaxed text-muted-foreground">
              Exact requirements and dates live on{" "}
              {app.schoolUrl ? (
                <a
                  href={app.schoolUrl.startsWith("http") ? app.schoolUrl : `https://${app.schoolUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary hover:opacity-75"
                >
                  the school&apos;s official site
                </a>
              ) : (
                <span>the school&apos;s official site</span>
              )}
              . We never guess them for you.
            </p>
            <div className="mt-1 border-t border-border/40 pt-2">
              <TaskList
                title="Your tasks for this school"
                filter={{ applicationId: app.application.id, institutionId: app.application.institutionId }}
                placeholder="Add a task — e.g. ask coach for a letter"
                onChanged={onTasksChanged}
              />
            </div>
            <div className="mt-1 flex items-center gap-4 border-t border-border/40 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => onSync(app.application.id)}
                className="press flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-primary disabled:opacity-40"
              >
                Check for updates
                {syncing && (
                  <span className="appear-delayed"><Loader2 className="size-3 animate-spin text-primary" strokeWidth={2.5} /></span>
                )}
              </button>
              {!submitted && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming("withdrawn")}
                  className="press text-[11px] font-semibold text-muted-foreground transition-colors hover:text-loss disabled:opacity-40"
                >
                  Stop tracking
                </button>
              )}
            </div>
          </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Two verbs, no more: the ONE life action for this card's state, and the
          expander. Maintenance actions live inside the checklist. State swaps
          animate — nothing pops. */}
      <motion.div layout transition={{ layout: { type: "spring", bounce: 0, duration: 0.35 } }} className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          {confirming ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2, transition: { duration: 0.1, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="mx-4 mb-3.5 mt-1 flex items-center justify-between gap-2 rounded-xl bg-accent px-3 py-2"
            >
              <span className="text-[11px] leading-snug text-muted-foreground">
                {confirming === "submitted" ? "Mark this application as submitted?" : "Stop tracking this application?"}
              </span>
              <span className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    onLifeEvent(app.application.id, confirming);
                    setConfirming(null);
                  }}
                  className={`press rounded-full px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 ${
                    confirming === "submitted" ? "bg-primary" : "bg-loss"
                  }`}
                >
                  {confirming === "submitted" ? "Yes, submitted" : "Stop tracking"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(null)}
                  className="press rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Back
                </button>
              </span>
            </motion.div>
          ) : heardBack ? (
            <motion.div
              key="heard"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2, transition: { duration: 0.1, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="mx-4 mb-3.5 mt-1 flex flex-wrap items-center gap-1.5 rounded-xl bg-accent px-3 py-2"
            >
              <span className="mr-1 text-[11px] text-muted-foreground">They said:</span>
              {(["admitted", "waitlisted", "deferred", "denied"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    onLifeEvent(app.application.id, d as "admitted" | "denied" | "waitlisted");
                    setHeardBack(false);
                  }}
                  className={`press rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-40 ${
                    d === "admitted" ? "bg-win/15 text-win hover:bg-win/25" : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
              <button type="button" onClick={() => setHeardBack(false)} className="press ml-auto text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                Back
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="footer"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2, transition: { duration: 0.1, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="flex items-center gap-4 px-4 pb-3.5 pt-1"
            >
              {app.application.latestDecision === "ADMITTED" && app.application.status !== "ENROLLED" ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onEnroll(app)}
                  className="cta-btn press flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[11.5px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  This is where I&apos;m going
                  {lifeEventPending && (
                    <span className="appear-delayed"><Loader2 className="size-3 animate-spin" strokeWidth={2.5} /></span>
                  )}
                </button>
              ) : !submitted ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirming("submitted")}
                  className="press flex items-center gap-1.5 text-[11.5px] font-semibold text-win transition-opacity hover:opacity-75 disabled:opacity-40"
                >
                  I submitted it
                  {lifeEventPending && (
                    <span className="appear-delayed"><Loader2 className="size-3 animate-spin" strokeWidth={2.5} /></span>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setHeardBack(true)}
                  className="press flex items-center gap-1.5 text-[11.5px] font-semibold text-primary transition-opacity hover:opacity-75 disabled:opacity-40"
                >
                  I heard back
                  {lifeEventPending && (
                    <span className="appear-delayed"><Loader2 className="size-3 animate-spin" strokeWidth={2.5} /></span>
                  )}
                </button>
              )}
              {(
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-expanded={open}
                  className="press ml-auto flex items-center gap-0.5 text-[11.5px] font-bold text-primary transition-opacity hover:opacity-75"
                >
                  {open ? "Hide tasks" : openTasks > 0 ? `Tasks & details (${openTasks} open)` : "Tasks & details"}
                  <ChevronRight className={`size-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`} strokeWidth={2.5} aria-hidden />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  );
}

export function OllieApplications({ refreshKey }: { refreshKey: number }) {
  const [apps, setApps] = useState<TrackedApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  // WHICH thing is working: one requirement, or one app's sync.
  const [syncingApp, setSyncingApp] = useState<string | null>(null);
  const [lifeEventApp, setLifeEventApp] = useState<string | null>(null);
  // Open-task counts per application, for the card face — the slice itself
  // lives in TaskList; this is just the "(N open)" hint on the expander.
  const [allTasks, setAllTasks] = useState<LearnerTask[]>([]);

  const loadTasks = () => {
    startTransition(async () => {
      const res = await getTasks();
      if (res.ok) setAllTasks(res.tasks);
    });
  };

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

  useEffect(() => {
    load();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const onSync = (id: string) => {
    if (syncingApp || lifeEventApp) return;
    setSyncingApp(id);
    startTransition(async () => {
      const res = await syncApplication(id);
      if (res.ok) toast.success("Checked the school's latest — your checklist is current");
      else toast.error(res.message || "Couldn't check for updates just now.");
      load();
      setSyncingApp(null);
    });
  };

  // The events that MOVE an application. Submitted/withdrawn are status
  // versions (attributed history); heard-back records the school's decision.
  const onLifeEvent = (appId: string, event: "submitted" | "withdrawn" | "admitted" | "denied" | "waitlisted") => {
    if (syncingApp || lifeEventApp) return;
    setLifeEventApp(appId);
    startTransition(async () => {
      let res: { ok: boolean; message?: string };
      if (event === "submitted") res = await updateApplicationStatus(appId, "SUBMITTED", "Marked submitted by the learner");
      else if (event === "withdrawn") res = await updateApplicationStatus(appId, "WITHDRAWN", "Learner stopped tracking");
      else res = await recordDecision(appId, event.toUpperCase() as "ADMITTED" | "DENIED" | "WAITLISTED");
      if (res.ok) {
        toast.success(
          event === "submitted"
            ? "Submitted — well done. I'll watch for the decision window."
            : event === "withdrawn"
              ? "Stopped tracking — nothing else changes."
              : event === "admitted"
                ? "An admit — recorded. Tell Ollie if this is the one."
                : `Recorded: ${event}. Every answer is information — the plan adjusts.`,
        );
      } else {
        toast.error(res.message || "That didn't save — nothing changed.");
      }
      load();
      setLifeEventApp(null);
    });
  };

  // The REAL commit moment: an admit the learner says yes to. Records
  // ENROLLED on the application and commits the school — My Plan, Funding,
  // and Ollie's voice all reorient; the rest of the list becomes backups.
  const onEnroll = (app: TrackedApplication) => {
    if (syncingApp || lifeEventApp) return;
    setLifeEventApp(app.application.id);
    startTransition(async () => {
      const res = await updateApplicationStatus(app.application.id, "ENROLLED", "Learner chose this school after an admit");
      if (res.ok) {
        await commitSchool(app.application.institutionId, "commit");
        toast.success(`${app.school} it is. Everything now plans around it — congratulations.`);
      } else {
        toast.error(res.message || "That didn't save — nothing changed.");
      }
      load();
      setLifeEventApp(null);
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

  const act = nextAction(apps);
  const applying = apps.filter((a) => !SUBMITTED_STATES.has(a.application.status)).length;
  const submitted = apps.length - applying;
  const nextDue = apps
    .flatMap((a) => a.application.deadlines.filter((d) => dayjs(d.dueAt).isAfter(dayjs())))
    .sort((x, y) => dayjs(x.dueAt).valueOf() - dayjs(y.dueAt).valueOf())[0];

  return (
    <div>
      {/* The season at a glance */}
      <div className="grid grid-cols-3 border-b border-border/70 bg-muted/30 text-center">
        {[
          { n: String(applying), label: "applying" },
          { n: String(submitted), label: "submitted" },
          { n: nextDue ? dayjs(nextDue.dueAt).fromNow(true) : "—", label: "to next deadline" },
        ].map((x) => (
          <div key={x.label} className="px-2 py-2.5">
            <p className="relative overflow-hidden text-lg font-black tabular-nums text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={x.n}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="block"
                >
                  {x.n}
                </motion.span>
              </AnimatePresence>
            </p>
            <p className="text-[9px] font-bold uppercase text-muted-foreground">{x.label}</p>
          </div>
        ))}
      </div>

      {/* v3: what do I do RIGHT NOW — one thing, on top */}
      <AnimatePresence initial={false}>
      {act && (
        <motion.div
          layout
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.15 } }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mx-4 mt-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5">
          <p className="text-sm font-semibold text-foreground">
            Next up: your {act.school} application
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Due {act.dueIn}{act.estimated ? " (estimated date)" : ""}.
          </p>
        </motion.div>
      )}
      </AnimatePresence>

      <ul className="space-y-2.5 px-3 py-3">
        <AnimatePresence initial={false}>
        {apps.map((a, i) => (
          <Row
            key={a.application.id}
            app={a}
            index={i}
            onSync={onSync}
            syncing={syncingApp === a.application.id}
            onLifeEvent={onLifeEvent}
            onEnroll={onEnroll}
            lifeEventPending={lifeEventApp === a.application.id}
            openTasks={allTasks.filter((t) => t.applicationId === a.application.id && !t.done).length}
            onTasksChanged={loadTasks}
          />
        ))}
        </AnimatePresence>
      </ul>
      <p className="px-4 pb-3 text-[11px] leading-relaxed text-muted-foreground">
        Submitting is always your action. Nothing here submits for you.
      </p>
    </div>
  );
}
