"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getShortlist } from "../service";
import type { ShortlistItem, ShortlistView } from "../types";
import { WARM, WARM_SOFT } from "./ollie-theme";

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
  FINANCIAL_SAFETY: { label: "Safety", color: "var(--win)" },
  LIKELY: { label: "Likely", color: "var(--win)" },
  TARGET: { label: "Target", color: "var(--primary)" },
  REACH: { label: "Reach", color: "var(--loss)" },
  HIGH_UNCERTAINTY: { label: "Unsure", color: "var(--muted-foreground)" },
  SPECIAL_PATHWAY: { label: "Pathway", color: "var(--social)" },
  STRATEGIC_WILDCARD: { label: "Wildcard", color: "var(--gold)" },
};

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
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">{item.institution}</h3>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: c.color }}>
          <span className="size-1.5 rounded-full" style={{ background: c.color }} aria-hidden />
          {c.label}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{item.program}</p>

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

const STEPS: { key: "field" | "degree" | "budget"; label: string }[] = [
  { key: "field", label: "Field of study" },
  { key: "degree", label: "Degree level" },
  { key: "budget", label: "Yearly budget" },
];

// The three-step momentum stepper shown while the shortlist is still locked.
function ProgressStepper({ progress }: { progress: ShortlistView["progress"] }) {
  const done = STEPS.filter((s) => progress[s.key]).length;
  const nextPending = STEPS.find((s) => !progress[s.key]);
  return (
    <div className="px-5 py-6">
      <p className="text-sm font-semibold text-foreground">You&apos;re building your list</p>
      <p className="mt-1 text-xs text-muted-foreground">Three quick things unlock your shortlist.</p>

      <div className="mt-4 space-y-2.5">
        {STEPS.map((s) => {
          const isDone = progress[s.key];
          return (
            <div key={s.key} className="flex items-center gap-2.5 text-sm">
              <span
                className="flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: isDone ? WARM : "transparent", border: isDone ? "none" : "1.5px solid var(--border)" }}
              >
                {isDone ? "✓" : ""}
              </span>
              <span className={isDone ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          style={{ background: WARM }}
          initial={{ width: 0 }}
          animate={{ width: `${(done / STEPS.length) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {done} of {STEPS.length} —{" "}
        {nextPending ? <>tell me your {nextPending.label.toLowerCase()} next.</> : "all set!"}
      </p>
    </div>
  );
}

// The live shortlist. Refetches whenever `refreshKey` changes (after each chat
// turn) so it tracks the conversation without ever putting schools in the chat.
export function OllieShortlist({ refreshKey }: { refreshKey: number }) {
  const [view, setView] = useState<ShortlistView | null>(null);
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getShortlist();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  const count = view?.ready ? view.options.length : 0;

  return (
    <div className="flex h-full flex-col bg-background/40">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm text-muted-foreground">
          {view?.ready ? (count > 0 ? `${count} school${count === 1 ? "" : "s"}` : "Nothing to show yet") : "Building as we talk"}
        </p>
        {loading && (
          <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            updating
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Not ready — a friendly momentum stepper */}
        {view && !view.ready && <ProgressStepper progress={view.progress} />}

        {/* A warm encouragement line once real schools are on the list */}
        {view?.ready && count > 0 && (
          <div
            className="mx-5 mt-4 rounded-xl px-3.5 py-2.5 text-sm font-medium"
            style={{ background: WARM_SOFT, color: WARM }}
          >
            Your list is taking shape — tell me more and I&apos;ll sharpen it.
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
        <AnimatePresence>
          {view?.ready && view.options.length > 0 && (
            <ul>
              {view.options.map((item, i) => (
                <Row key={item.optionId} item={item} index={i} />
              ))}
            </ul>
          )}
        </AnimatePresence>

        {/* First load, nothing yet */}
        {!view && loading && (
          <div className="px-5 py-6 text-sm text-muted-foreground">Pulling your shortlist together…</div>
        )}
      </div>
    </div>
  );
}
