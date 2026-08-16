"use client";

import { useState, useTransition } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import { saveTransferCourses } from "../service";
import { useTransferCourse } from "../_hooks/use-transfer-course";
import type { TransferCourse, TransferOverview } from "../types";

// The transfer workspace (UX-008): list what you've earned, see an HONEST
// ranged estimate of what likely moves with you and the revised time to degree.
// Every number is framed as an estimate — the receiving school decides.

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
const TYPE_WORDS: Record<TransferCourse["type"], string> = {
  "gen-ed": "Gen ed",
  major: "Major",
  elective: "Elective",
};

export function TransferWorkspace({ initial }: { initial: TransferOverview }) {
  const [view, setView] = useState(initial);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const persist = (courses: TransferCourse[]) => {
    const prev = view;
    setView((v) => ({ ...v, courses }));
    setError(null);
    startSave(async () => {
      const res = await saveTransferCourses(courses);
      if (!res.ok) {
        setView(prev);
        setError(res.message);
        return;
      }
      // Re-read: estimate + time-to-degree are computed server-side.
      const { getTransfer } = await import("../service");
      const fresh = await getTransfer();
      if (fresh.ok) setView(fresh.view);
    });
  };

  const { form, onSubmit } = useTransferCourse((c) => persist([...view.courses, c]));
  const e = view.estimate;
  const t = view.timeToDegree;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-[11px] font-black uppercase text-primary">Transfer</p>
        <h1 className="text-xl font-bold text-foreground">What likely moves with you</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          List the credits you&apos;ve earned and see an honest estimate — a range, not a promise. The receiving
          school&apos;s evaluation is always the real answer.
        </p>
      </header>

      {error && <p className="rounded-2xl bg-loss/10 px-4 py-2.5 text-sm text-loss">{error}</p>}

      {/* The estimate — only once there's something to estimate */}
      {view.courses.length > 0 && (
        <section className="glossy rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <p className="text-[11px] font-black uppercase text-muted-foreground">Likely to transfer</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {e.retainedLow}–{e.retainedHigh}
                <span className="ml-1 text-sm font-medium text-muted-foreground">of {view.totals.credits} credits</span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase text-muted-foreground">Left for a bachelor&apos;s</p>
              <p className="text-2xl font-bold tabular-nums text-foreground">
                {t.remainingLow}–{t.remainingHigh}
                <span className="ml-1 text-sm font-medium text-muted-foreground">≈ {t.yearsLow}–{t.yearsHigh} yrs full-time</span>
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold">Estimate only.</span> {e.why} {t.basis}
          </p>
          {e.belowGradeCredits > 0 && (
            <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--gold)" }}>
              {e.belowGradeCredits} credit{e.belowGradeCredits === 1 ? "" : "s"} below a C — most schools don&apos;t
              accept those, so they&apos;re outside the range.
            </p>
          )}
        </section>
      )}

      {/* The credit list */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Credits earned</h2>
          <p className="text-xs text-muted-foreground">
            {view.courses.length === 0
              ? "None yet"
              : `${view.totals.credits} credits · ${view.totals.byType["gen-ed"]} gen ed / ${view.totals.byType.major} major / ${view.totals.byType.elective} elective`}
            {saving && " · saving…"}
          </p>
        </div>
        {view.courses.length === 0 ? (
          <p className="px-5 py-6 text-sm leading-relaxed text-muted-foreground">
            Add each course below — general-education courses usually move well; major courses depend on the program
            you&apos;re heading into.
          </p>
        ) : (
          <ul>
            {view.courses.map((c, i) => (
              <li key={`${c.courseName}-${i}`} className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{c.courseName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {TYPE_WORDS[c.type]} · {c.source}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold tabular-nums text-foreground">{c.grade}</span>
                  <span className="text-xs text-muted-foreground">{c.credits} cr</span>
                  <button
                    type="button"
                    aria-label={`Remove ${c.courseName}`}
                    disabled={saving}
                    onClick={() => persist(view.courses.filter((_, j) => j !== i))}
                    className="text-xs text-muted-foreground transition-colors hover:text-loss disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add a course */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Add a course</h2>
        <Form {...form}>
          <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ControlledInput name="courseName" label="Course name" placeholder="English Composition I" />
              <ControlledInput name="source" label="Earned at" placeholder="Valencia College" />
              <ControlledSelect
                name="type"
                label="Counts toward"
                values={[
                  { name: "General education", value: "gen-ed" },
                  { name: "My major", value: "major" },
                  { name: "Elective", value: "elective" },
                ]}
              />
              <ControlledSelect name="grade" label="Grade earned" placeholder="Pick a grade" values={GRADES.map((g) => ({ name: g, value: g }))} />
              <ControlledInput name="credits" label="Credits" type="number" placeholder="3" />
              <ControlledInput name="subject" label="Subject" placeholder="English" optional />
            </div>
            <div>
              <Button type="submit" loading={saving} className="rounded-full">
                Add credit
              </Button>
            </div>
          </form>
        </Form>
      </section>

      {/* Paths people don't know they have */}
      <section className="flex flex-col gap-3">
        {view.pathways.map((p) => (
          <div key={p.key} className="rounded-2xl border border-border bg-card px-5 py-4">
            <p className="text-sm font-semibold text-foreground">{p.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
          </div>
        ))}
      </section>

      {/* Do now + the honest notes */}
      {view.tasks.length > 0 && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Worth doing now</h2>
          <ul className="mt-2 flex flex-col gap-2.5">
            {view.tasks.map((task) => (
              <li key={task.title}>
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{task.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="flex flex-col gap-2 pb-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{view.articulation.note}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{view.residencyNote.text}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{view.affordabilityNote}</p>
      </div>
    </div>
  );
}
