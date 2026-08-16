"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveGedProgress, saveResponsibilities } from "../service";
import type { GedOverview, GedResponsibility, GedSubject } from "../types";

// The GED-to-college workspace (UX-007): finish the credential, then pick a
// doorway. Strengths-based throughout — progress and doors, never deficits.

const SHORT_NAMES: Record<GedSubject["subject"], string> = {
  "Reasoning Through Language Arts": "Language Arts",
  "Mathematical Reasoning": "Math",
  Science: "Science",
  "Social Studies": "Social Studies",
};

const STATUS_WORDS: Record<GedSubject["status"], string> = {
  "not-started": "not started",
  scheduled: "scheduled",
  passed: "passed",
};

const RESPONSIBILITIES: { value: GedResponsibility; label: string }[] = [
  { value: "working", label: "Working" },
  { value: "parenting", label: "Parenting" },
  { value: "caregiving", label: "Caregiving" },
  { value: "military", label: "Military" },
];

export function GedWorkspace({ initial }: { initial: GedOverview }) {
  const [view, setView] = useState(initial);
  const [saving, startSave] = useTransition();

  // Tap a subject to cycle its status — the twin write follows the tap.
  const cycle = (index: number) => {
    const order: GedSubject["status"][] = ["not-started", "scheduled", "passed"];
    const subjects = view.subjects.map((s, i) =>
      i === index ? { ...s, status: order[(order.indexOf(s.status) + 1) % order.length] } : s,
    );
    const passedCount = subjects.filter((s) => s.status === "passed").length;
    setView((v) => ({ ...v, subjects, passedCount, complete: passedCount === subjects.length }));
    startSave(async () => {
      await saveGedProgress(subjects);
    });
  };

  const toggleResponsibility = (r: GedResponsibility) => {
    const next = view.responsibilities.includes(r)
      ? view.responsibilities.filter((x) => x !== r)
      : [...view.responsibilities, r];
    setView((v) => ({ ...v, responsibilities: next }));
    startSave(async () => {
      await saveResponsibilities(next);
    });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-[11px] font-black uppercase text-primary">GED to college</p>
        <h1 className="text-xl font-bold text-foreground">
          {view.complete ? "Credential earned — pick your doorway" : "Finish the credential, then pick a doorway"}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {view.passedCount} of {view.subjects.length} subjects passed{saving ? " · saving…" : ""}. Tap a subject to
          update where you are.
        </p>
      </header>

      {/* Subject progress — completion planning, never test content */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Your four subjects</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {view.subjects.map((s, i) => (
            <button
              key={s.subject}
              type="button"
              onClick={() => cycle(i)}
              className={`flex items-center justify-between rounded-full border px-4 py-2.5 text-left text-sm transition-colors ${
                s.status === "passed"
                  ? "border-win/40 bg-win/10 text-foreground"
                  : s.status === "scheduled"
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
              }`}
            >
              <span className="font-medium">{SHORT_NAMES[s.subject]}</span>
              <span className={`text-[11px] font-semibold ${s.status === "passed" ? "text-win" : s.status === "scheduled" ? "text-primary" : ""}`}>
                {STATUS_WORDS[s.status]}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{view.fundingNote}</p>
      </section>

      {/* The three doorways */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">Three real doorways</h2>
        {view.pathways.map((p) => (
          <Link
            key={p.key}
            href={p.link}
            className="glossy hover-lift rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40"
          >
            <p className="text-sm font-semibold text-foreground">{p.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
          </Link>
        ))}
        <p className="text-xs leading-relaxed text-muted-foreground">{view.placementNote.text}</p>
      </section>

      {/* Life alongside study */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">What you carry alongside study</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Tap what applies — your plan and matches respect your real load.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {RESPONSIBILITIES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => toggleResponsibility(r.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                view.responsibilities.includes(r.value)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {/* Do now */}
      {view.tasks.length > 0 && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Worth doing now</h2>
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
    </div>
  );
}
