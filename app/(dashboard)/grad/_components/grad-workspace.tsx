"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveGradProfile, saveSupervisors } from "../service";
import type { GradOverview, GradPathway, TargetSupervisor } from "../types";

// The grad workspace (UX-009): graduate school as its own thing. The first
// decision is the pathway (classes vs research apprenticeship); research
// applicants build a supervisor list whose "availability" is only ever what
// the professor themselves said.

const STATUS_WORDS: Record<TargetSupervisor["status"], string> = {
  identified: "found",
  contacted: "wrote to them",
  responded: "they replied",
  declined: "not taking students",
};

export function GradWorkspace({ initial }: { initial: GradOverview }) {
  const [view, setView] = useState(initial);
  const [saving, startSave] = useTransition();

  const setPathway = (pathway: GradPathway) => {
    setView((v) => ({ ...v, pathway }));
    startSave(async () => {
      await saveGradProfile({ pathway });
      const { getGrad } = await import("../service");
      const fresh = await getGrad();
      if (fresh.ok) setView(fresh.view);
    });
  };

  const cycleSupervisor = (index: number) => {
    const order: TargetSupervisor["status"][] = ["identified", "contacted", "responded", "declined"];
    const next = view.supervisors.map((s, i) =>
      i === index ? { ...s, status: order[(order.indexOf(s.status) + 1) % order.length] } : s,
    );
    setView((v) => ({ ...v, supervisors: next }));
    startSave(async () => {
      await saveSupervisors(next.map(({ name, institution, topic, status }) => ({ name, institution, topic, status })));
      const { getGrad } = await import("../service");
      const fresh = await getGrad();
      if (fresh.ok) setView(fresh.view);
    });
  };

  const addSupervisor = (s: TargetSupervisor) => {
    const next = [...view.supervisors.map(({ name, institution, topic, status }) => ({ name, institution, topic, status })), s];
    startSave(async () => {
      await saveSupervisors(next);
      const { getGrad } = await import("../service");
      const fresh = await getGrad();
      if (fresh.ok) setView(fresh.view);
    });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-[11px] font-black uppercase text-primary">Grad studies</p>
        <h1 className="text-xl font-bold text-foreground">Graduate school, on its own terms</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Not undergrad with bigger words — different applications, different money, different decisions
          {saving ? " · saving…" : ""}.
        </p>
      </header>

      {/* The fork */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Which kind of program?</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          This choice changes everything downstream — pick the one that matches what you want.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPathway("coursework")}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              view.pathway === "coursework" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">Coursework</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Classes toward a credential — an MBA, an M.Ed., most professional master&apos;s degrees.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPathway("research")}
            className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
              view.pathway === "research" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
            }`}
          >
            <p className="text-sm font-semibold text-foreground">Research</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              An apprenticeship with a supervisor — thesis master&apos;s and doctoral programs.
            </p>
          </button>
        </div>
      </section>

      {/* Supervisor list — research pathway only */}
      {view.pathway === "research" && (
        <section className="rounded-2xl border border-border bg-card px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Your supervisor list</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            In research programs you apply to a person as much as a school. Tap a status to update it — availability
            here is only ever what they themselves said.
          </p>
          {view.supervisors.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2.5">
              {view.supervisors.map((s, i) => (
                <li key={`${s.name}-${i}`} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {s.name} <span className="text-xs text-muted-foreground">· {s.institution}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">{s.availability}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => cycleSupervisor(i)}
                    className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                      s.status === "responded"
                        ? "bg-win/15 text-win"
                        : s.status === "declined"
                          ? "bg-muted text-muted-foreground"
                          : "bg-accent text-accent-foreground hover:bg-primary/15"
                    }`}
                  >
                    {STATUS_WORDS[s.status]}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <AddSupervisor disabled={saving} onAdd={addSupervisor} />
        </section>
      )}

      {/* Cross-domain doors */}
      <section className="flex flex-col gap-3">
        {view.connections.map((c) => (
          <Link
            key={c.key}
            href={c.link}
            className="hover-lift rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/40"
          >
            <p className="text-sm font-semibold text-foreground">{c.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.detail}</p>
          </Link>
        ))}
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

function AddSupervisor({ onAdd, disabled }: { onAdd: (s: TargetSupervisor) => void; disabled: boolean }) {
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Dr. A. Chen"
        className="h-9 min-w-32 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <input
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        placeholder="University of Florida"
        className="h-9 min-w-32 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={disabled || !name.trim() || !institution.trim()}
        onClick={() => {
          onAdd({ name: name.trim(), institution: institution.trim(), status: "identified" });
          setName("");
          setInstitution("");
        }}
      >
        Add
      </Button>
    </div>
  );
}
