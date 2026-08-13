"use client";

import { useState, useTransition } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import ControlledCheckboxGroup from "@/components/molecules/controlled-checkbox";
import { saveEvaluators, saveTranscript } from "../service";
import { useCourseForm } from "../_hooks/use-course-form";
import type { HomeschoolCourse, HomeschoolEvaluator, HomeschoolOverview } from "../types";

// The homeschool workspace (UX-006): the transcript the family builds, with
// curriculum provenance and rigor evidence per course — treated as a REAL
// academic record (it feeds matching as your GPA), never a gap to explain.

const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
const RIGOR: { label: string; value: string }[] = [
  { label: "AP", value: "AP" },
  { label: "CLEP", value: "CLEP" },
  { label: "Dual enrollment", value: "dual-enrollment" },
  { label: "Honors", value: "honors" },
  { label: "Portfolio", value: "portfolio" },
  { label: "External exam", value: "external-exam" },
];

const SOURCE_WORDS: Record<string, string> = {
  provider: "curriculum provider",
  "co-op": "co-op",
  "self-designed": "designed at home",
};

const EVAL_STATUS: Record<HomeschoolEvaluator["status"], string> = {
  planned: "planned",
  asked: "asked",
  received: "letter in hand",
};

export function HomeschoolWorkspace({ initial }: { initial: HomeschoolOverview }) {
  const [view, setView] = useState(initial);
  const [saving, startSave] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const persist = (courses: HomeschoolCourse[]) => {
    const prev = view;
    setView((v) => ({ ...v, courses })); // optimistic — the twin write follows
    setError(null);
    startSave(async () => {
      const res = await saveTranscript(courses);
      if (res.ok) setView((v) => ({ ...v, computedGpa: res.computedGpa ?? v.computedGpa, credits: courses.reduce((s, c) => s + c.credits, 0) }));
      else {
        setView(prev);
        setError(res.message);
      }
    });
  };

  const { form, onSubmit } = useCourseForm((course) => persist([...view.courses, course]));

  const cycleEvaluator = (index: number) => {
    const order: HomeschoolEvaluator["status"][] = ["planned", "asked", "received"];
    const next = view.evaluators.map((e, i) =>
      i === index ? { ...e, status: order[(order.indexOf(e.status) + 1) % order.length] } : e,
    );
    setView((v) => ({ ...v, evaluators: next }));
    startSave(async () => {
      await saveEvaluators(next);
    });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-[11px] font-black uppercase text-primary">Homeschool</p>
        <h1 className="text-xl font-bold text-foreground">Your transcript, your record</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Courses you add here count exactly like any school&apos;s transcript — your grades become the GPA your matches
          use{view.computedGpa != null ? ` (currently ${view.computedGpa.toFixed(2)} from ${view.courses.length} courses)` : ""}.
        </p>
      </header>

      {error && <p className="rounded-2xl bg-loss/10 px-4 py-2.5 text-sm text-loss">{error}</p>}

      {/* The transcript */}
      <section className="relative rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Courses</h2>
          <p className="text-xs text-muted-foreground">
            {view.courses.length === 0
              ? "None yet"
              : `${view.courses.length} · ${view.credits} credit${view.credits === 1 ? "" : "s"}${view.dualEnrollmentCount ? ` · ${view.dualEnrollmentCount} dual-enrollment` : ""}`}
            {saving && " · saving…"}
          </p>
        </div>
        {view.courses.length === 0 ? (
          <p className="px-5 py-6 text-sm leading-relaxed text-muted-foreground">
            Add your first course below — name, subject, grade, and where the curriculum came from. Every version is
            kept; nothing is ever overwritten.
          </p>
        ) : (
          <ul>
            {view.courses.map((c, i) => (
              <li key={`${c.name}-${i}`} className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-3 last:border-b-0">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {c.name} <span className="font-normal text-muted-foreground">· grade {c.gradeLevel}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {c.subject} · {SOURCE_WORDS[c.curriculum.source]}
                    {c.curriculum.provider ? ` (${c.curriculum.provider})` : ""}
                    {c.dualEnrollment ? ` · at ${c.dualEnrollment.institution}` : ""}
                  </p>
                  {c.rigor.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.rigor.map((r) => (
                        <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {RIGOR.find((x) => x.value === r)?.label ?? r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-bold tabular-nums text-foreground">{c.grade}</span>
                  <span className="text-xs text-muted-foreground">{c.credits} cr</span>
                  <button
                    type="button"
                    aria-label={`Remove ${c.name}`}
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
              <ControlledInput name="name" label="Course name" placeholder="Biology with labs" />
              <ControlledInput name="subject" label="Subject" placeholder="Science" />
              <ControlledSelect
                name="gradeLevel"
                label="Year taken"
                placeholder="Pick the grade year"
                values={["9", "10", "11", "12"].map((g) => ({ name: `Grade ${g}`, value: g }))}
              />
              <ControlledSelect
                name="grade"
                label="Grade earned"
                placeholder="Pick a grade"
                values={GRADES.map((g) => ({ name: g, value: g }))}
              />
              <ControlledInput name="credits" label="Credits" type="number" placeholder="1" />
              <ControlledSelect
                name="curriculumSource"
                label="Curriculum from"
                values={[
                  { name: "A curriculum provider", value: "provider" },
                  { name: "A co-op", value: "co-op" },
                  { name: "Designed at home", value: "self-designed" },
                ]}
              />
              <ControlledInput name="provider" label="Provider name" placeholder="Apologia, Saxon…" optional />
              <ControlledInput
                name="dualEnrollmentInstitution"
                label="Dual-enrollment college"
                placeholder="Valencia College"
                optional
              />
            </div>
            <ControlledCheckboxGroup name="rigor" label="Rigor evidence" optional options={RIGOR} className="flex-wrap" />
            <div>
              <Button type="submit" loading={saving} className="rounded-full">
                Add to transcript
              </Button>
            </div>
          </form>
        </Form>
      </section>

      {/* Outside voices */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Outside voices</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Recommenders and evaluators from outside your household. Tap a status to update it.
        </p>
        {view.evaluators.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {view.evaluators.map((e, i) => (
              <li key={`${e.name}-${i}`} className="flex items-center justify-between gap-3">
                <p className="text-sm text-foreground">
                  {e.name} <span className="text-xs text-muted-foreground">· {e.role}</span>
                </p>
                <button
                  type="button"
                  onClick={() => cycleEvaluator(i)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    e.status === "received" ? "bg-win/15 text-win" : "bg-accent text-accent-foreground hover:bg-primary/15"
                  }`}
                >
                  {EVAL_STATUS[e.status]}
                </button>
              </li>
            ))}
          </ul>
        )}
        <AddEvaluator
          disabled={saving}
          onAdd={(e) => {
            const next = [...view.evaluators, e];
            setView((v) => ({ ...v, evaluators: next }));
            startSave(async () => {
              await saveEvaluators(next);
            });
          }}
        />
      </section>

      {/* What to do next + the honest state note */}
      {view.tasks.length > 0 && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Worth doing</h2>
          <ul className="mt-2 flex flex-col gap-2.5">
            {view.tasks.map((t) => (
              <li key={t.title}>
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{t.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="pb-4 text-xs leading-relaxed text-muted-foreground">{view.stateNote.text}</p>
    </div>
  );
}

// A tiny inline add row — name + role, status starts at "planned".
function AddEvaluator({ onAdd, disabled }: { onAdd: (e: HomeschoolEvaluator) => void; disabled: boolean }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<HomeschoolEvaluator["role"]>("recommender");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Coach Rivera"
        className="h-9 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <button
        type="button"
        onClick={() => setRole((r) => (r === "recommender" ? "evaluator" : "recommender"))}
        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {role}
      </button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={disabled || !name.trim()}
        onClick={() => {
          onAdd({ name: name.trim(), role, status: "planned" });
          setName("");
        }}
      >
        Add
      </Button>
    </div>
  );
}
