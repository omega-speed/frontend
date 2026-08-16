"use client";

import { useState, useTransition } from "react";
import { saveInternational } from "../service";
import type { EnglishTestPlan, FundingSource, InternationalOverview } from "../types";

// The Global overlay workspace (UX-010): the SAME shortlist through
// international eyes, the US destination pack with effective dates, and the
// border-crossing checklist. Process guidance, never legal advice.

const TESTS: EnglishTestPlan["test"][] = ["TOEFL", "IELTS", "Duolingo", "PTE", "not-needed"];
const TEST_STATUS: Record<EnglishTestPlan["status"], string> = {
  planning: "planning",
  scheduled: "scheduled",
  done: "done",
};
const FUNDING: { value: FundingSource; label: string }[] = [
  { value: "family", label: "Family" },
  { value: "sponsor", label: "A sponsor" },
  { value: "self", label: "My savings" },
  { value: "scholarship-needed", label: "Need scholarships" },
];

const RULE_TYPE_WORDS: Record<string, string> = {
  work_rights: "Working while studying",
  post_study: "After you graduate",
  language: "English requirements",
  cost: "Money & proof of funds",
  credential: "Your credentials",
  admissions_context: "How admissions works",
  calendar: "The calendar",
};

export function InternationalWorkspace({ initial }: { initial: InternationalOverview }) {
  const [view, setView] = useState(initial);
  const [saving, startSave] = useTransition();

  const refresh = () =>
    startSave(async () => {
      const { getInternational } = await import("../service");
      const fresh = await getInternational();
      if (fresh.ok) setView(fresh.view);
    });

  const setTest = (test: EnglishTestPlan["test"]) => {
    const plan: EnglishTestPlan = { test, status: view.englishTest?.test === test ? nextStatus(view.englishTest.status) : "planning" };
    setView((v) => ({ ...v, englishTest: plan }));
    startSave(async () => {
      await saveInternational({ englishTest: plan });
      refresh();
    });
  };

  const setFunding = (fundingSource: FundingSource) => {
    setView((v) => ({ ...v, fundingSource }));
    startSave(async () => {
      await saveInternational({ fundingSource });
      refresh();
    });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-[11px] font-black uppercase text-primary">International</p>
        <h1 className="text-xl font-bold text-foreground">
          Your plan, across the border{view.homeCountry ? ` — from ${view.homeCountry}` : ""}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Same shortlist, same funding, same essays — this page adds only what crossing a border adds
          {saving ? " · saving…" : ""}.
        </p>
      </header>

      {/* English test + funding source */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">English test</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Pick your test, then tap it again to move it planning → scheduled → done.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TESTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTest(t)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                view.englishTest?.test === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {t === "not-needed" ? "Not needed" : t}
              {view.englishTest?.test === t && t !== "not-needed" ? ` · ${TEST_STATUS[view.englishTest.status]}` : ""}
            </button>
          ))}
        </div>
        <h2 className="mt-5 text-sm font-semibold text-foreground">Who funds it</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {FUNDING.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFunding(f.value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                view.fundingSource === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* The shortlist through international eyes */}
      {view.schools.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-foreground">Your shortlist, international view</h2>
          {view.schools.map((s) => (
            <div key={s.institution} className="rounded-2xl border border-border bg-card px-5 py-4">
              <p className="text-sm font-semibold text-foreground">{s.institution}</p>
              {s.context ? (
                <>
                  <ul className="mt-2 space-y-1">
                    {s.context.facts.map((f, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {s.context.unknowns.length > 0 && (
                    <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--gold)" }}>
                      Still unknown: {s.context.unknowns.join("; ")}
                    </p>
                  )}
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{s.context.admissionContextNote}</p>
                </>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">No international data for this school yet — honest gap, not a bad sign.</p>
              )}
            </div>
          ))}
          <p className="text-xs leading-relaxed text-muted-foreground">{view.costNote}</p>
        </section>
      )}

      {/* Destination pack */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Studying in the {view.destinationPack.destination} — the ground rules
        </h2>
        {view.destinationPack.covered ? (
          <ul className="mt-3 flex flex-col gap-3">
            {view.destinationPack.rules.map((r) => (
              <li key={r.id}>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  {RULE_TYPE_WORDS[r.ruleType] ?? r.ruleType.replace(/_/g, " ")}
                  <span className="ml-2 font-medium normal-case">{r.statusLabel}</span>
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-foreground">{r.ruleText}</p>
                {r.interpretation && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Our read: {r.interpretation}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{view.destinationPack.note}</p>
        )}
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

      <div className="flex flex-col gap-2 pb-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{view.boundaryNote}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{view.honestyNote}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{view.collaborationNote}</p>
      </div>
    </div>
  );
}

function nextStatus(s: EnglishTestPlan["status"]): EnglishTestPlan["status"] {
  return s === "planning" ? "scheduled" : s === "scheduled" ? "done" : "planning";
}
