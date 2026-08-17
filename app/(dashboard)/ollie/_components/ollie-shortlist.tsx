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

// v3-A: "How this school scores N for you" — every factor, its evidence, and
// math a 15-year-old can recompute. Unknowns are NOT counted, never a penalty.
function FitBreakdown({ item, onClose }: { item: ShortlistItem; onClose: () => void }) {
  const counted = item.breakdown.filter((f) => f.value != null);
  const recomputed = recomputeFit(item.breakdown);
  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 z-40 cursor-default" tabIndex={-1} />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-lg"
      >
        <p className="text-sm font-bold text-foreground">How {item.institution} scores {item.fitScore} for you</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Fit measures this school against <span className="font-semibold text-foreground">what you said matters</span>.
          Every factor we can score counts equally; what we don&apos;t know yet is left out — never counted against a school.
        </p>
        <dl className="mt-2.5 space-y-2 border-t border-border/70 pt-2.5">
          {item.breakdown.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <dt className="text-[11px] font-bold uppercase text-foreground">{f.label}</dt>
                <dd className="text-[11px] leading-snug text-muted-foreground">{f.detail}</dd>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${f.value != null ? "bg-gold/15 text-gold" : "bg-muted text-muted-foreground"}`}>
                {f.value != null ? `${f.value}/100` : "not counted"}
              </span>
            </div>
          ))}
        </dl>
        <p className="mt-2.5 border-t border-border/70 pt-2 text-[11px] font-semibold tabular-nums text-foreground">
          Average of {counted.length} factor{counted.length === 1 ? "" : "s"} = {recomputed ?? item.fitScore} fit
        </p>
        <div className="mt-2 flex gap-3 text-[11px] font-semibold text-primary">
          <Link href="/ollie?panel=about" className="hover:opacity-80">Change what matters to me</Link>
        </div>
        <p className="mt-2 border-t border-border/70 pt-2 text-[10px] leading-relaxed text-muted-foreground">
          <span className="font-bold">What fit is not:</span> your chance of getting in, and not a ranking. It changes
          when you change — update your profile and every score recalculates.
        </p>
      </motion.div>
    </>
  );
}

function Row({
  item,
  index,
  onCommit,
  committing,
}: {
  item: ShortlistItem;
  index: number;
  onCommit?: (item: ShortlistItem, action: "commit" | "uncommit") => void;
  committing?: boolean;
}) {
  const c = item.committed ? { label: "Your school", color: "var(--primary)" } : (CATEGORY[item.category ?? ""] ?? CATEGORY.HIGH_UNCERTAINTY);
  const [open, setOpen] = useState(false);
  const [mathOpen, setMathOpen] = useState(false);
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className={`border-b border-border/70 px-5 py-4 last:border-b-0 ${item.committed ? "bg-primary/5" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-snug text-foreground">
            {item.institutionId ? (
              <Link href={`/schools/${item.institutionId}`} className="transition-colors hover:text-primary">
                {item.institution}
              </Link>
            ) : (
              item.institution
            )}
          </h3>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: c.color }}>
            <span className="size-1.5 rounded-full" style={{ background: c.color }} aria-hidden />
            {c.label}
          </span>
        </div>
        {item.fitScore != null && (
          <span className="relative inline-flex flex-col items-center">
            <FitRing score={item.fitScore} />
            {item.breakdown.length > 0 && (
              <button
                type="button"
                aria-label={`How the ${item.fitScore} fit was computed`}
                onClick={() => setMathOpen((v) => !v)}
                className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-border text-[9px] font-bold text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                i
              </button>
            )}
            <AnimatePresence>{mathOpen && <FitBreakdown item={item} onClose={() => setMathOpen(false)} />}</AnimatePresence>
          </span>
        )}
      </div>
      {item.program && <p className="mt-0.5 text-xs text-muted-foreground">{item.program}</p>}

      {item.athletics?.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {item.athletics.map((a, i) => (
            <span
              key={i}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: WARM_SOFT, color: WARM }}
            >
              Also fields {a.sport}
              {a.division ? ` · ${a.division}` : ""}
            </span>
          ))}
        </div>
      )}

      {item.reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {item.reasons.map((r, i) => (
            <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}

      {item.breakdown.length > 0 && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-primary"
            aria-expanded={open}
          >
            <span className={`inline-block transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
            {open ? "Hide the evidence" : "Why this one"}
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <dl className="mt-2 space-y-2.5 border-l border-border pl-3">
                  {item.breakdown.map((f, i) => (
                    <div key={i}>
                      <dt className="flex items-center gap-2 text-[11px] font-bold uppercase text-foreground">
                        {f.label}
                        {CONFIDENCE_NOTE[f.confidence] && (
                          <span className="font-medium normal-case text-muted-foreground">· {CONFIDENCE_NOTE[f.confidence]}</span>
                        )}
                      </dt>
                      <dd className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.detail}</dd>
                    </div>
                  ))}
                </dl>
                {onCommit && item.institutionId && !item.committed && (
                  <button
                    type="button"
                    disabled={committing}
                    onClick={() => onCommit(item, "commit")}
                    className="mt-3 rounded-full border border-primary/40 px-3 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-40"
                  >
                    This is my school — commit
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
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
  const onCommit = (item: ShortlistItem, action: "commit" | "uncommit") => {
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



        {/* The commitment — the learner's decision, owned and reversible */}
        {view?.ready && view.committed && (
          <div className="glossy mx-5 mt-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              You committed to {view.committed.institution}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Your plan, funding and applications now point there. The rest of this list stays as backups.
            </p>
            <button
              type="button"
              disabled={committing}
              onClick={() =>
                onCommit(
                  { institutionId: view.committed!.institutionId } as ShortlistItem,
                  "uncommit",
                )
              }
              className="mt-2 text-[11px] font-semibold text-primary transition-opacity hover:opacity-70 disabled:opacity-40"
            >
              Changed your mind? Take it back
            </button>
          </div>
        )}

        {/* Ollie's one-line read on the list (AI-written; static fallback) */}
        {view?.ready && count > 0 && !busy && (
          <div
            className="mx-5 mt-4 rounded-xl px-3.5 py-2.5 text-sm font-medium"
            style={{ background: WARM_SOFT, color: WARM }}
          >
            {view.note ?? "Your list is taking shape — tell me more and I'll sharpen it."}
          </div>
        )}

        {/* Ready but empty */}
        {view?.ready && view.options.length === 0 && (
          <div className="px-5 py-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              No programs in your field are loaded yet — as more schools come in, they&apos;ll appear here.
            </p>
          </div>
        )}

        {/* The list */}
        {view?.ready && view.options.length > 0 && (
          <p className="border-b border-border/70 bg-accent/40 px-5 py-2 text-[11px] leading-relaxed text-accent-foreground">
            <span className="font-semibold">Matched to your profile.</span> Fit is about you, not rankings — the ring is
            how well each school matches what YOU said matters.
          </p>
        )}
        <AnimatePresence>
          {view?.ready && view.options.length > 0 && (() => {
            const lane = (cats: string[]) => view.options.filter((o) => !o.committed && cats.includes(o.category ?? ""));
            // v3 lanes: Sure footing (foundation, not fallback) / Strong fit
            // (the heart of the list) / Aspiration (the stretch is YOURS).
            const lanes = [
              { key: "committed", title: "Your school — committed", blurb: null, items: view.options.filter((o) => o.committed) },
              { key: "picks", title: view.committed ? "Backups you picked" : "Your picks", blurb: null, items: lane(["PINNED"]) },
              { key: "sure", title: "Sure footing", blurb: "Schools that check your boxes and where the numbers say you belong. Not a fallback, a foundation.", items: lane(["FINANCIAL_SAFETY", "LIKELY"]) },
              { key: "strong", title: "Strong fit", blurb: "The heart of the list. Your criteria met, your profile in range.", items: lane(["TARGET", "STRATEGIC_WILDCARD", "SPECIAL_PATHWAY"]) },
              { key: "aspiration", title: "Aspiration", blurb: "Worth the stretch — and the stretch is yours.", items: lane(["REACH"]) },
              { key: "unknown", title: "Need more info to place", blurb: null, items: lane(["HIGH_UNCERTAINTY"]) },
            ].filter((l) => l.items.length > 0);
            let idx = 0;
            return (
              <div className={`transition-opacity duration-300 ${busy ? "opacity-40" : "opacity-100"}`}>
                {lanes.map((l) => (
                  <div key={l.key}>
                    <div className="border-b border-border/70 bg-muted/40 px-5 py-1.5">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">{l.title}</p>
                      {l.blurb && <p className="text-[10px] leading-snug text-muted-foreground/80">{l.blurb}</p>}
                    </div>
                    <ul>
                      {l.items.map((item) => (
                        <Row key={item.optionId} item={item} index={idx++} onCommit={onCommit} committing={committing} />
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
