"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getFunding } from "../service";
import type { FundingAward, FundingView } from "../types";
import { WARM, WARM_SOFT } from "./ollie-theme";

// Outcome → a quiet colour cue, same language as the shortlist.
const OUTCOME: Record<string, { label: string; color: string }> = {
  ELIGIBLE: { label: "Eligible", color: "var(--win)" },
  LIKELY_ELIGIBLE: { label: "Likely eligible", color: "var(--social)" },
  UNCERTAIN: { label: "Worth checking", color: "var(--muted-foreground)" },
  INELIGIBLE: { label: "Not eligible", color: "var(--loss)" },
};

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function amountLabel(a: FundingAward): string {
  if (a.amountMin != null && a.amountMax != null && a.amountMin !== a.amountMax) return `${money(a.amountMin)}–${money(a.amountMax)}`;
  const one = a.amountMax ?? a.amountMin;
  return one != null ? money(one) : "Amount varies";
}

function Row({ award, index }: { award: FundingAward; index: number }) {
  const [open, setOpen] = useState(false);
  const o = OUTCOME[award.outcome] ?? OUTCOME.UNCERTAIN;
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className="border-b border-border/70 px-5 py-4 last:border-b-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">{award.name}</h3>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: o.color }}>
          <span className="size-1.5 rounded-full" style={{ background: o.color }} aria-hidden />
          {o.label}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {award.sponsor} · {amountLabel(award)}
        {award.renewable ? " · renewable" : ""}
        {award.deadline ? ` · due ${award.deadline}` : ""}
      </p>
      {award.schoolTied && (
        <p className="mt-1 text-xs font-medium" style={{ color: WARM }}>
          Only if you attend {award.schoolTied}
        </p>
      )}

      {(award.why.length > 0 || award.openQuestions.length > 0) && (
        <div className="mt-2.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-primary"
            aria-expanded={open}
          >
            <span className={`inline-block transition-transform duration-200 ${open ? "rotate-90" : ""}`}>›</span>
            {open ? "Hide the why" : "Why you qualify"}
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
                <div className="mt-2 space-y-1 border-l border-border pl-3">
                  {award.why.map((w, i) => (
                    <p key={i} className="text-xs leading-relaxed text-muted-foreground">{w}</p>
                  ))}
                  {award.openQuestions.length > 0 && (
                    <p className="pt-1 text-xs leading-relaxed text-muted-foreground/80">
                      Still open: {award.openQuestions.join("; ")}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.li>
  );
}

// The Funding tab: top assessed awards, refreshed alongside the shortlist.
export function OllieFunding({ refreshKey, refreshing = false }: { refreshKey: number; refreshing?: boolean }) {
  const [view, setView] = useState<FundingView | null>(null);
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getFunding();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  const busy = refreshing || loading;
  const count = view?.awards.length ?? 0;

  return (
    <div className="flex h-full flex-col bg-background/40">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm text-muted-foreground">
          {view ? (count > 0 ? `${count} award${count === 1 ? "" : "s"} worth your time` : "Nothing assessed yet") : "Finding money for you"}
        </p>
        {busy && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: WARM }}>
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: WARM }} />
            updating
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        {busy && view && (
          <div className="mx-5 mt-4 rounded-xl px-3.5 py-2.5 text-sm font-medium" style={{ background: WARM_SOFT, color: WARM }}>
            Re-checking what you qualify for…
          </div>
        )}

        {view && count === 0 && !busy && (
          <p className="px-5 py-6 text-sm leading-relaxed text-muted-foreground">
            Tell me about yourself in the chat — your field, level, GPA, home state — and I&apos;ll surface scholarships you can actually get.
          </p>
        )}

        <AnimatePresence>
          {count > 0 && (
            <ul className={`transition-opacity duration-300 ${busy ? "opacity-40" : "opacity-100"}`}>
              {view!.awards.map((a, i) => (
                <Row key={a.id} award={a} index={i} />
              ))}
            </ul>
          )}
        </AnimatePresence>

        {!view && busy && <div className="px-5 py-6 text-sm text-muted-foreground">Checking the scholarship catalog…</div>}
      </div>
    </div>
  );
}
