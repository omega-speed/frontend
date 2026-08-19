"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { commitSchool, getShortlist } from "../service";
import type { ShortlistItem, ShortlistView } from "../types";
import { WARM, WARM_SOFT } from "./ollie-theme";
import { PanelEmpty, PanelListSkeleton } from "./panel-bits";

// LOW-confidence factors are honest estimates; flag them quietly.
const CONFIDENCE_NOTE: Record<string, string> = {
  LOW: "estimate",
  MODERATE: "fairly sure",
  HIGH: "confident",
};

// Category → a small, quiet colour cue (a dot + word). Deliberately restrained —
// no glossy cards or accent rails — so the panel reads like a real advisor's
// working list, not a generated grid.
// v3 lane language — student-facing names only. The internal enum values
// (safe/target/reach) never reach a student's screen.
const CATEGORY: Record<string, { label: string; color: string }> = {
  PINNED: { label: "Your pick", color: "var(--gold)" },
  FINANCIAL_SAFETY: { label: "Sure footing, easy on money", color: "var(--win)" },
  LIKELY: { label: "Sure footing", color: "var(--win)" },
  TARGET: { label: "Strong fit", color: "var(--primary)" },
  REACH: { label: "Aspiration", color: "var(--gold)" },
  HIGH_UNCERTAINTY: { label: "Need more info", color: "var(--muted-foreground)" },
  SPECIAL_PATHWAY: { label: "Pathway", color: "var(--social)" },
  STRATEGIC_WILDCARD: { label: "Wildcard", color: "var(--primary)" },
};


// The fit ring: 0–100 match to the learner's OWN stated criteria — deliberately
// NOT admission odds (annotation 5 in the mockup: "fit score, not admit odds").
function FitRing({ score }: { score: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative inline-flex size-10 shrink-0 items-center justify-center" title="Match to your criteria — not admission odds">
      <svg viewBox="0 0 36 36" className="size-10 -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--muted)" strokeWidth="3" />
        <motion.circle
          cx="18" cy="18" r={r} fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round"
          initial={{ strokeDasharray: c, strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute text-[11px] font-bold tabular-nums text-foreground">{score}</span>
    </span>
  );
}

// The popover's math and the ring's number are ONE formula (mirrors the
// backend's recomputeFitScore, which is pinned by parity tests there).
export function recomputeFit(rows: { value: number | null; weight: number }[]): number | null {
  const counted = rows.filter((r) => r.value != null && r.weight > 0);
  if (counted.length === 0) return null;
  const wsum = counted.reduce((a, r) => a + r.weight, 0);
  const acc = counted.reduce((a, r) => a + ((r.value as number) / 100) * r.weight, 0);
  return Math.round((Math.round((acc / wsum) * 100) / 100) * 100);
}

function Row({
  item,
  index,
  laneTitle,
  onCommit,
  committing,
}: {
  item: ShortlistItem;
  index: number;
  laneTitle?: string;
  onCommit?: (item: ShortlistItem, action: "add" | "remove" | "commit" | "uncommit") => void;
  committing?: boolean;
}) {
  const c = item.committed ? { label: "Your school", color: "var(--primary)" } : (CATEGORY[item.category ?? ""] ?? CATEGORY.HIGH_UNCERTAINTY);
  // The lane header already names the lane — the card pill repeats it only when
  // it says MORE than the header (e.g. "Sure footing, easy on money").
  const pillRedundant = !!laneTitle && laneTitle.toLowerCase().startsWith(c.label.toLowerCase());
  const [open, setOpen] = useState(false);
  const pinned = item.category === "PINNED" || item.committed;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className={`list-none rounded-2xl border bg-card transition-colors ${
        item.committed ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/25"
      }`}
    >
      <div className="p-4">
        {/* Header: who + how well */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold leading-snug text-foreground">
              {item.institutionId ? (
                <Link href={`/schools/${item.institutionId}`} className="transition-colors hover:text-primary">
                  {item.institution}
                </Link>
              ) : (
                item.institution
              )}
            </h3>
            {(!pillRedundant || item.program) && (
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                {!pillRedundant && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-black"
                    style={{ color: c.color, background: `color-mix(in oklab, ${c.color} 12%, transparent)` }}
                  >
                    {c.label}
                  </span>
                )}
                {item.program && <span className="truncate text-[11px] text-muted-foreground">{item.program}</span>}
              </div>
            )}
          </div>
          {item.fitScore != null &&
            (item.breakdown.length > 0 ? (
              // The ring IS the button — tap the number to see how it was made.
              <button
                type="button"
                aria-label={`How the ${item.fitScore} fit was computed`}
                aria-expanded={open}
                title="See how this number was made"
                onClick={() => setOpen((v) => !v)}
                className="press shrink-0 rounded-full transition-shadow hover:shadow-[0_0_0_3px_color-mix(in_oklab,var(--gold)_30%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <FitRing score={item.fitScore} />
              </button>
            ) : (
              <span className="shrink-0"><FitRing score={item.fitScore} /></span>
            ))}
        </div>

        {/* YOUR boxes, checked — the card's spine (v3) */}
        {item.criteria.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {item.criteria.map((cr) => (
              <span
                key={cr.label}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
                  cr.state === "met"
                    ? "bg-win/10 text-win"
                    : cr.state === "miss"
                      ? "bg-muted text-muted-foreground line-through decoration-muted-foreground/40"
                      : "border border-dashed border-border text-muted-foreground"
                }`}
              >
                <span aria-hidden>{cr.state === "met" ? "✓" : cr.state === "miss" ? "✕" : "?"}</span>
                {cr.label}
              </span>
            ))}
          </div>
        )}

        {item.athletics?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.athletics.map((a, i) => (
              <span key={i} className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: WARM_SOFT, color: WARM }}>
                Fields {a.sport}
                {a.division ? ` · ${a.division}` : ""}
              </span>
            ))}
          </div>
        )}

        {/* One honest line; the rest lives behind "Why this one" */}
        {item.reasons[0] && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.reasons[0]}</p>
        )}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              {item.reasons.length > 1 && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.reasons[1]}</p>
              )}
              <dl className="mt-2.5 space-y-2.5 border-l border-border pl-3">
                {item.breakdown.map((f, i) => (
                  <div key={i} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <dt className="flex items-center gap-2 text-[11px] font-bold uppercase text-foreground">
                        {f.label}
                        {CONFIDENCE_NOTE[f.confidence] && (
                          <span className="font-medium normal-case text-muted-foreground">· {CONFIDENCE_NOTE[f.confidence]}</span>
                        )}
                      </dt>
                      <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.detail}</dd>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums ${f.value != null ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>
                      {f.value != null ? `${f.value}/100` : "not counted"}
                    </span>
                  </div>
                ))}
              </dl>
              {item.fitScore != null && (
                <p className="mt-2.5 border-t border-border/60 pt-2 text-[11px] font-semibold tabular-nums text-foreground">
                  Average of {item.breakdown.filter((f) => f.value != null).length} factors = {recomputeFit(item.breakdown) ?? item.fitScore} fit
                  <Link href="/ollie?panel=about" className="ml-3 font-semibold text-primary hover:opacity-80">Change what matters to me</Link>
                </p>
              )}
              <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                <span className="font-bold">What fit is not:</span> your chance of getting in, and not a ranking. It
                changes when you change — update your profile and every score recalculates.
              </p>
              {/* The big decision lives here, deliberately — not on the card face */}
              {onCommit && item.institutionId && !item.committed && (
                <button
                  type="button"
                  disabled={committing}
                  onClick={() => onCommit(item, "commit")}
                  className="cta-btn mt-3 w-full rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  This is my school — commit
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer: quick actions always visible, quiet */}
      <div className="flex items-center gap-1 border-t border-border/60 px-2 py-1.5">
        {onCommit && item.institutionId && !pinned && (
          <button
            type="button"
            disabled={committing}
            onClick={() => onCommit(item, "add")}
            className="press rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
          >
            Keep on my list
          </button>
        )}
        {onCommit && item.institutionId && !item.committed && (
          <button
            type="button"
            disabled={committing}
            onClick={() => onCommit(item, "remove")}
            title="Takes it off and keeps it off — you can always add it back by name"
            className="press rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground shadow-xs transition-colors hover:border-loss/40 hover:text-loss disabled:opacity-40"
          >
            Not for me
          </button>
        )}
        {item.breakdown.length > 0 && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className={`press ml-auto flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${
              open
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary/35 bg-primary/5 text-primary hover:bg-primary/10"
            }`}
          >
            {open ? "Hide the evidence" : "Why this one"}
            <span className={`inline-block transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
          </button>
        )}
      </div>
    </motion.li>
  );
}

// The live shortlist. Refetches whenever `refreshKey` changes (after each chat
// turn) so it tracks the conversation without ever putting schools in the chat.
export function OllieShortlist({ refreshKey, refreshing = false }: { refreshKey: number; refreshing?: boolean }) {
  const [view, setView] = useState<ShortlistView | null>(null);
  const [loading, startLoad] = useTransition();
  const [committing, startCommit] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getShortlist();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  // Commit / take it back, then re-read — the decision is the learner's alone,
  // recorded on their twin exactly like saying it to Ollie.
  const onCommit = (item: ShortlistItem, action: "add" | "remove" | "commit" | "uncommit") => {
    if (!item.institutionId) return;
    startCommit(async () => {
      const res = await commitSchool(item.institutionId!, action);
      if (res.ok) {
        const fresh = await getShortlist();
        if (fresh.ok) setView(fresh.view);
      }
    });
  };

  // Busy spans the WHOLE update: the backend re-score (refreshing) + the re-read
  // (loading). Without covering the first part, the panel looks stuck for seconds.
  const busy = refreshing || loading;
  const count = view?.ready ? view.options.length : 0;

  return (
    <div className="flex h-full flex-col bg-background/40">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm text-muted-foreground">
          {view?.ready ? (count > 0 ? `${count} school${count === 1 ? "" : "s"}` : "Nothing to show yet") : "Building as we talk"}
        </p>
        {busy && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: WARM }}>
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: WARM }} />
            updating
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* The update in progress — loud enough that the list never looks stuck */}
        {busy && view && (
          <div
            className="mx-5 mt-4 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium"
            style={{ background: WARM_SOFT, color: WARM }}
          >
            <span className="flex gap-1" aria-hidden>
              <span className="size-1.5 animate-bounce rounded-full [animation-delay:0ms]" style={{ background: WARM }} />
              <span className="size-1.5 animate-bounce rounded-full [animation-delay:150ms]" style={{ background: WARM }} />
              <span className="size-1.5 animate-bounce rounded-full [animation-delay:300ms]" style={{ background: WARM }} />
            </span>
            Reshaping your list with what you just told me…
          </div>
        )}

        {/* Not ready — a friendly momentum stepper */}
        {view && !view.ready && (
          <PanelEmpty
            title="Your list starts with one sentence"
            body="Tell Ollie anything about you — what you enjoy, where you'd love to live, even 'somewhere it snows' — and schools start appearing here."
            hint="I'm undecided — help me explore"
          />
        )}



        {/* The commitment — one quiet strip, owned and reversible */}
        {view?.ready && view.committed && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-full border border-primary/30 bg-primary/10 py-1.5 pl-4 pr-2">
            <p className="min-w-0 truncate text-xs font-semibold text-foreground">
              Your school: <span className="text-primary">{view.committed.institution}</span>
            </p>
            <button
              type="button"
              disabled={committing}
              onClick={() =>
                onCommit({ institutionId: view.committed!.institutionId } as ShortlistItem, "uncommit")
              }
              className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary disabled:opacity-40"
            >
              Take it back
            </button>
          </div>
        )}

        {/* Ollie's one-line read on the list (AI-written; static fallback) */}
        {view?.ready && count > 0 && !busy && (
          <p
            className="mx-4 mt-3 border-l-2 pl-3 text-xs leading-relaxed text-muted-foreground"
            style={{ borderColor: WARM }}
          >
            {view.note ?? "Your list is taking shape — tell me more and I'll sharpen it."}
          </p>
        )}

        {/* Ready but empty */}
        {view?.ready && view.options.length === 0 && (
          <div className="px-5 py-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              No programs in your field are loaded yet — as more schools come in, they&apos;ll appear here.
            </p>
          </div>
        )}

        <AnimatePresence>
          {view?.ready && view.options.length > 0 && (() => {
            const lane = (cats: string[]) => view.options.filter((o) => !o.committed && cats.includes(o.category ?? ""));
            // v3 lanes: Sure footing (foundation, not fallback) / Strong fit
            // (the heart of the list) / Aspiration (the stretch is YOURS).
            const lanes = [
              { key: "committed", title: "Your school", blurb: "Committed — everything plans around it.", color: "var(--primary)", items: view.options.filter((o) => o.committed) },
              { key: "picks", title: view.committed ? "Backups you picked" : "Your picks", blurb: null, color: "var(--gold)", items: lane(["PINNED"]) },
              { key: "sure", title: "Sure footing", blurb: "Not a fallback, a foundation.", color: "var(--win)", items: lane(["FINANCIAL_SAFETY", "LIKELY"]) },
              { key: "strong", title: "Strong fit", blurb: "The heart of the list — your criteria met, your profile in range.", color: "var(--primary)", items: lane(["TARGET", "STRATEGIC_WILDCARD", "SPECIAL_PATHWAY"]) },
              { key: "aspiration", title: "Aspiration", blurb: "Worth the stretch — and the stretch is yours.", color: "var(--gold)", items: lane(["REACH"]) },
              { key: "unknown", title: "Need more info to place", blurb: null, color: "var(--muted-foreground)", items: lane(["HIGH_UNCERTAINTY"]) },
            ].filter((l) => l.items.length > 0);
            let idx = 0;
            return (
              <div className={`transition-opacity duration-300 ${busy ? "opacity-40" : "opacity-100"}`}>
                {lanes.map((l) => (
                  <div key={l.key} className="mt-4 first:mt-2">
                    <div className="flex items-baseline gap-2 px-4">
                      <span className="h-3 w-1 shrink-0 self-center rounded-full" style={{ background: l.color }} aria-hidden />
                      <p className="text-[11px] font-black uppercase text-foreground">{l.title}</p>
                      <span className="text-[10px] font-bold tabular-nums text-muted-foreground">{l.items.length}</span>
                    </div>
                    {l.blurb && <p className="mt-0.5 px-4 pl-7 text-[10.5px] leading-snug text-muted-foreground">{l.blurb}</p>}
                    <ul className="space-y-2.5 px-3 pb-1 pt-2">
                      {l.items.map((item) => (
                        <Row key={item.optionId} item={item} index={idx++} laneTitle={l.title} onCommit={onCommit} committing={committing} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
        </AnimatePresence>

        {/* OL-005: honest cross-domain tensions — shown, never averaged away */}
        {view?.ready && (view.conflicts?.length ?? 0) > 0 && (
          <div className="border-t border-border/70 px-5 py-4">
            <p className="text-[11px] font-black uppercase text-muted-foreground">Worth naming</p>
            <div className="mt-2 flex flex-col gap-2">
              {view.conflicts!.map((c) => (
                <p
                  key={`${c.optionId ?? "portfolio"}-${c.statement.slice(0, 24)}`}
                  className="text-xs leading-relaxed"
                  style={{ color: c.severity === "HIGH" ? "var(--loss)" : "var(--gold)" }}
                >
                  {c.statement}
                </p>
              ))}
              {view.escalation && (
                <p className="text-xs leading-relaxed text-muted-foreground">{view.escalation}</p>
              )}
            </div>
          </div>
        )}

        {/* First load, nothing yet */}
        {!view && loading && (
          <PanelListSkeleton rows={4} />
        )}
      </div>
    </div>
  );
}
