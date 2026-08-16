"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { saveEvents, saveOutreach } from "../service";
import type { AthleteEvent, AthleteOverview, CoachContact } from "../types";

// The athlete workspace (UX-011): the same plan, with the recruiting side
// visible — schools that field your sport, the coach ladder (each rung distinct),
// your events, and the readiness blockers Q-Athlete already tracks.

const STAGES: CoachContact["status"][] = ["identified", "contacted", "responded", "visit", "offer"];
const STAGE_WORDS: Record<CoachContact["status"], string> = {
  identified: "on my list",
  contacted: "reached out",
  responded: "they replied",
  visit: "visit set",
  offer: "offer made",
};

export function AthleteWorkspace({ initial }: { initial: AthleteOverview }) {
  const [view, setView] = useState(initial);
  const [saving, startSave] = useTransition();

  const persistOutreach = (outreach: CoachContact[]) => {
    setView((v) => ({ ...v, outreach }));
    startSave(async () => {
      await saveOutreach(outreach);
      const { getAthlete } = await import("../service");
      const fresh = await getAthlete();
      if (fresh.ok) setView(fresh.view);
    });
  };

  const persistEvents = (events: AthleteEvent[]) => {
    setView((v) => ({ ...v, events }));
    startSave(async () => {
      await saveEvents(events);
      const { getAthlete } = await import("../service");
      const fresh = await getAthlete();
      if (fresh.ok) setView(fresh.view);
    });
  };

  const cycleStage = (index: number) => {
    persistOutreach(
      view.outreach.map((c, i) =>
        i === index ? { ...c, status: STAGES[(STAGES.indexOf(c.status) + 1) % STAGES.length] } : c,
      ),
    );
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-[11px] font-black uppercase text-primary">Athlete</p>
        <h1 className="text-xl font-bold text-foreground">Your sport, inside the same plan</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {view.laddersNote}
          {saving ? " · saving…" : ""}
        </p>
      </header>

      {/* Where your sport is fielded — from the same Q-Athlete the shortlist uses */}
      {view.sports.length > 0 && (
        <section className="rounded-2xl border border-border bg-card px-5 py-4">
          {view.sports.map((s) => (
            <div key={s.sport}>
              <h2 className="text-sm font-semibold text-foreground">Schools that field {s.sport}</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {s.schools.map((sch) => (
                  <span key={sch.institution} className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground">
                    {sch.institution}
                    {sch.division ? ` · ${sch.division}` : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            These flow into your <Link href="/ollie?panel=shortlist" className="font-semibold text-primary hover:opacity-80">shortlist</Link> like
            everything else — one list, athletics included.
          </p>
        </section>
      )}

      {/* The coach ladder */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Coach ladder</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{view.outreachNote} Tap a stage to update it.</p>
        {view.outreach.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2.5">
            {view.outreach.map((c, i) => (
              <li key={`${c.coach}-${i}`} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {c.coach} <span className="text-xs text-muted-foreground">· {c.institution} · {c.sport}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => cycleStage(i)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    c.status === "offer"
                      ? "bg-gold/15 text-gold"
                      : c.status === "responded" || c.status === "visit"
                        ? "bg-win/15 text-win"
                        : "bg-accent text-accent-foreground hover:bg-primary/15"
                  }`}
                >
                  {STAGE_WORDS[c.status]}
                </button>
              </li>
            ))}
          </ul>
        )}
        <AddCoach
          disabled={saving}
          defaultSport={view.sports[0]?.sport ?? ""}
          onAdd={(c) => persistOutreach([...view.outreach, c])}
        />
      </section>

      {/* Events */}
      <section className="rounded-2xl border border-border bg-card px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Showcases & events</h2>
        {view.events.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1.5">
            {view.events.map((e, i) => (
              <li key={`${e.name}-${i}`} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground">{e.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs tabular-nums text-muted-foreground">{e.date}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${e.name}`}
                    disabled={saving}
                    onClick={() => persistEvents(view.events.filter((_, j) => j !== i))}
                    className="text-xs text-muted-foreground transition-colors hover:text-loss disabled:opacity-40"
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <AddEvent disabled={saving} onAdd={(e) => persistEvents([...view.events, e])} />
      </section>

      {/* Readiness + tasks */}
      {view.tasks.length > 0 && (
        <section className="rounded-2xl border border-primary/25 bg-primary/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Worth doing now</h2>
          <ul className="mt-2 flex flex-col gap-2.5">
            {view.tasks.map((t) => (
              <li key={t.title}>
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                {t.detail && <p className="text-xs leading-relaxed text-muted-foreground">{t.detail}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2 pb-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{view.aidNote}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{view.healthNote}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{view.postAthleticNote}</p>
      </div>
    </div>
  );
}

function AddCoach({
  onAdd,
  disabled,
  defaultSport,
}: {
  onAdd: (c: CoachContact) => void;
  disabled: boolean;
  defaultSport: string;
}) {
  const [coach, setCoach] = useState("");
  const [institution, setInstitution] = useState("");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        value={coach}
        onChange={(e) => setCoach(e.target.value)}
        placeholder="Coach Rivera"
        className="h-9 min-w-32 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <input
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        placeholder="Florida State University"
        className="h-9 min-w-32 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={disabled || !coach.trim() || !institution.trim() || !defaultSport}
        onClick={() => {
          onAdd({ coach: coach.trim(), institution: institution.trim(), sport: defaultSport, status: "identified" });
          setCoach("");
          setInstitution("");
        }}
      >
        Add
      </Button>
    </div>
  );
}

function AddEvent({ onAdd, disabled }: { onAdd: (e: AthleteEvent) => void; disabled: boolean }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="State showcase"
        className="h-9 min-w-32 flex-1 rounded-full border border-input bg-background px-3.5 text-sm placeholder:text-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="h-9 rounded-full border border-input bg-background px-3.5 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="rounded-full"
        disabled={disabled || !name.trim() || !date}
        onClick={() => {
          onAdd({ name: name.trim(), date });
          setName("");
          setDate("");
        }}
      >
        Add
      </Button>
    </div>
  );
}
