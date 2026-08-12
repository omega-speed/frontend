"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getShortlist } from "../service";
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
const CATEGORY: Record<string, { label: string; color: string }> = {
  PINNED: { label: "Your pick", color: "var(--gold)" },
  FINANCIAL_SAFETY: { label: "Sure bet, easy on money", color: "var(--win)" },
  LIKELY: { label: "Likely", color: "var(--win)" },
  TARGET: { label: "Target", color: "var(--primary)" },
  REACH: { label: "Worth the stretch", color: "var(--gold)" },
  HIGH_UNCERTAINTY: { label: "Need more info", color: "var(--muted-foreground)" },
  SPECIAL_PATHWAY: { label: "Pathway", color: "var(--social)" },
  STRATEGIC_WILDCARD: { label: "Wildcard", color: "var(--gold)" },
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

function Row({ item, index }: { item: ShortlistItem; index: number }) {
  const c = CATEGORY[item.category ?? ""] ?? CATEGORY.HIGH_UNCERTAINTY;
  const [open, setOpen] = useState(false);
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="border-b border-border/70 px-5 py-4 last:border-b-0"
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
        {item.fitScore != null && <FitRing score={item.fitScore} />}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{item.program}</p>

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

  useEffect(() => {
    startLoad(async () => {
      const res = await getShortlist();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

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
            const lane = (cats: string[]) => view.options.filter((o) => cats.includes(o.category ?? ""));
            const lanes = [
              { key: "picks", title: "Your picks", items: lane(["PINNED"]) },
              { key: "strong", title: "Strong fit — most boxes checked today", items: lane(["FINANCIAL_SAFETY", "LIKELY", "TARGET", "STRATEGIC_WILDCARD", "SPECIAL_PATHWAY"]) },
              { key: "aspiration", title: "Aspiration — worth the stretch", items: lane(["REACH"]) },
              { key: "unknown", title: "Need more info to place", items: lane(["HIGH_UNCERTAINTY"]) },
            ].filter((l) => l.items.length > 0);
            let idx = 0;
            return (
              <div className={`transition-opacity duration-300 ${busy ? "opacity-40" : "opacity-100"}`}>
                {lanes.map((l) => (
                  <div key={l.key}>
                    <p className="border-b border-border/70 bg-muted/40 px-5 py-1.5 text-[10px] font-black uppercase text-muted-foreground">
                      {l.title}
                    </p>
                    <ul>
                      {l.items.map((item) => (
                        <Row key={item.optionId} item={item} index={idx++} />
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
