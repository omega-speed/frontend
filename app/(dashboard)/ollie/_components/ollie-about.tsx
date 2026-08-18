"use client";

import { useEffect, useState, useTransition } from "react";
import { PanelListSkeleton } from "./panel-bits";
import { motion, AnimatePresence } from "framer-motion";
import { getAbout, undoDeclare } from "../service";
import type { AboutFact, AboutView } from "../types";

// The About You panel, per the approved mockups: a navy TWIN CARD with the gold
// completeness meter up top, then the profile as GROUPED, REMOVABLE CHIPS —
// the living proof that Ollie remembers. Facts still shaping the shortlist are
// solid; captured-but-not-scored facts are dashed (honesty preserved), and the
// meter's next hint becomes a visible "tell Ollie" prompt card.

const GROUPS: { key: string; label: string; match: (f: AboutFact) => boolean }[] = [
  { key: "about", label: "About you", match: (f) => f.category === "academic" || f.category === "background" },
  { key: "interests", label: "Interests & activities", match: (f) => f.category === "interest" },
  {
    key: "fit",
    label: "What fits you",
    match: (f) => ["preference", "financial", "constraint", "goal", "athlete", "circumstance", "wish"].includes(f.category),
  },
];

function Chip({
  fact,
  scoring,
  onRemove,
  busy,
  index,
}: {
  fact: AboutFact;
  scoring: boolean;
  onRemove: (f: AboutFact) => void;
  busy: boolean;
  index: number;
}) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      title={scoring ? "Shaping your shortlist" : "Noted — not shaping your list yet; tell Ollie if it should"}
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full py-1.5 pl-3 pr-2 text-xs leading-none ${
        scoring
          ? "bg-accent text-accent-foreground"
          : "border border-dashed border-border bg-transparent text-muted-foreground"
      }`}
    >
      <span className="truncate">
        <span className={scoring ? "text-muted-foreground" : "text-muted-foreground/70"}>{fact.label}</span>{" "}
        <span className={`font-bold ${scoring ? "text-foreground" : "text-muted-foreground"}`}>{fact.value}</span>
      </span>
      <button
        type="button"
        aria-label={`Remove ${fact.label}`}
        disabled={busy}
        onClick={() => onRemove(fact)}
        className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] text-muted-foreground/60 transition-colors hover:bg-loss/10 hover:text-loss disabled:opacity-40"
      >
        ✕
      </button>
    </motion.span>
  );
}

export function OllieAbout({ refreshKey, onProfileChanged }: { refreshKey: number; onProfileChanged?: () => void }) {
  const [view, setView] = useState<AboutView | null>(null);
  const [loading, startLoad] = useTransition();
  const [busy, startBusy] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getAbout();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  // Remove a fact from HERE: optimistic, same undo path as the chat receipt,
  // then the panels re-score off the changed profile.
  const removeFact = (f: AboutFact) => {
    setView((v) =>
      v
        ? { ...v, using: v.using.filter((x) => x !== f), noted: v.noted.filter((x) => x !== f) }
        : v,
    );
    startBusy(async () => {
      await undoDeclare([{ category: f.category, name: f.name, value: f.rawValue, label: `${f.label} → ${f.value}` }]);
      onProfileChanged?.();
    });
  };

  const empty = view && view.using.length === 0 && view.noted.length === 0;
  const meter = view?.completeness;
  const scoringSet = new Set(view?.using ?? []);
  const all = view ? [...view.using, ...view.noted] : [];
  const grouped = GROUPS.map((g) => ({ ...g, facts: all.filter(g.match) })).filter((g) => g.facts.length > 0);
  const other = all.filter((f) => !GROUPS.some((g) => g.match(f)));

  return (
    <div className="flex h-full flex-col">
      {/* The twin card — navy, gold meter, per the mockup. This is the product's
          memory made visible. */}
      {meter && !empty && (
        <div className="px-4 pt-3">
          <div
            className="glossy relative overflow-hidden rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(140deg, var(--navy), oklch(0.31 0.055 280))" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full"
              style={{ background: "radial-gradient(circle, oklch(0.62 0.24 303 / 0.35), transparent 70%)" }}
            />
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold">Ollie knows {meter.knownCount} thing{meter.knownCount === 1 ? "" : "s"} about you</p>
              <p className="text-lg font-black tabular-nums text-gold">{meter.percent}%</p>
            </div>
            <p className="mt-0.5 text-[11px] text-white/60">Built from your chats — every bit of it yours to change</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--gold), oklch(0.8 0.11 90))" }}
                initial={{ width: 0 }}
                animate={{ width: `${meter.percent}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!view && loading && <PanelListSkeleton rows={3} />}

        {empty && (
          <div className="px-1 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nothing here yet — this page fills itself as you talk. Tell Ollie anything: what you enjoy,
              where you&apos;d love to live, what you can spend.
            </p>
          </div>
        )}

        {view && !empty && (
          <div className="space-y-5">
            {[...grouped, ...(other.length ? [{ key: "other", label: "Also noted", facts: other }] : [])].map((g) => (
              <section key={g.key}>
                <p className="mb-2 text-[10px] font-black uppercase text-muted-foreground">{g.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {g.facts.map((f, i) => (
                      <Chip
                        key={`${f.category}/${f.name}/${f.value}`}
                        fact={f}
                        scoring={scoringSet.has(f)}
                        onRemove={removeFact}
                        busy={busy}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}

            {/* The missing-item prompt — the meter's next hint made actionable */}
            {meter && meter.percent < 100 && (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase text-primary">One thing would sharpen this</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{meter.nextHint}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Just say it in the chat — it lands here on its own.</p>
              </div>
            )}

            <p className="flex items-center gap-3 border-t border-border/60 pt-3 text-[10px] leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-accent" aria-hidden />shaping your list</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full border border-dashed border-border" aria-hidden />noted, not scored yet</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
