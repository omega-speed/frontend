"use client";

import { useEffect, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { getFunding, hideAward, setAwardStatus } from "../service";
import type { FundingAward, FundingView } from "../types";
import { WARM, WARM_SOFT } from "./ollie-theme";
import { PanelEmpty, PanelListSkeleton } from "./panel-bits";

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

const MY_STATUS: Record<string, { label: string; className: string }> = {
  applying: { label: "applying", className: "bg-primary/10 text-primary" },
  applied: { label: "applied", className: "bg-social/15 text-social" },
  won: { label: "won", className: "bg-win/15 text-win" },
  missed: { label: "not this time", className: "bg-muted text-muted-foreground" },
};

function Row({
  award,
  index,
  onStatus,
  onHide,
  onAnswer,
  busy,
}: {
  award: FundingAward;
  index: number;
  onStatus: (award: FundingAward, status: "applying" | "applied" | "won" | "missed" | null) => void;
  onHide: (award: FundingAward) => void;
  onAnswer: (question: string) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const o = OUTCOME[award.outcome] ?? OUTCOME.UNCERTAIN;
  const mine = award.myStatus ? MY_STATUS[award.myStatus] : null;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.28, delay: index * 0.05, layout: { type: "spring", bounce: 0, duration: 0.45 } }}
      className="border-b border-border/70 px-5 py-4 last:border-b-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">{award.name}</h3>
        <span className="flex shrink-0 items-center gap-2">
          {mine && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${mine.className}`}>{mine.label}</span>
          )}
          <span className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: o.color }}>
            <span className="size-1.5 rounded-full" style={{ background: o.color }} aria-hidden />
            {o.label}
          </span>
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{amountLabel(award)}</span>
        {award.renewable ? ", renewable each year" : ""} from {award.sponsor}
      </p>
      {award.deadline && (
        <p
          className={`mt-0.5 text-xs ${
            dayjs(award.deadline).diff(dayjs(), "day") <= 14 && dayjs(award.deadline).isAfter(dayjs())
              ? "font-semibold text-gold"
              : "text-muted-foreground"
          }`}
        >
          Closes {dayjs(award.deadline).format("MMM D")}, {dayjs(award.deadline).fromNow()}
        </p>
      )}
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
            className="press flex items-center gap-1 text-[11px] font-semibold uppercase text-muted-foreground transition-[transform,color] hover:text-primary"
            aria-expanded={open}
          >
            <ChevronRight className={`size-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`} strokeWidth={2.5} aria-hidden />
            {open ? "Hide the why" : "Why you qualify"}
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1 border-l border-border pl-3">
                  {award.why.map((w, i) => (
                    <p key={i} className="text-xs leading-relaxed text-muted-foreground">{w}</p>
                  ))}
                  {award.openQuestions.length > 0 && (
                    <div className="pt-1.5">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground/70">Still to answer</p>
                      {award.openQuestions.map((q, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => onAnswer(q)}
                          title="Answer this in the chat"
                          className="press block text-left text-xs leading-relaxed text-muted-foreground/80 transition-[transform,color] hover:text-primary"
                        >
                          {q.charAt(0).toUpperCase() + q.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* The learner's moves: apply link, the ladder, and an honest way out. */}
      <div className="mt-2.5 flex items-center gap-4">
        {award.url && (
          <a
            href={award.url.startsWith("http") ? award.url : `https://${award.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex items-center text-[11px] font-semibold text-primary transition-[transform,opacity] hover:opacity-75"
          >
            Open the application
            <ArrowUpRight className="ml-0.5 size-3" strokeWidth={2.5} aria-hidden />
          </a>
        )}
        {!award.myStatus && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(award, "applying")}
            className="press text-[11px] font-semibold text-win transition-[transform,opacity] hover:opacity-75 disabled:opacity-40"
          >
            I&apos;m applying
          </button>
        )}
        {award.myStatus === "applying" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(award, "applied")}
            className="press text-[11px] font-semibold text-win transition-[transform,opacity] hover:opacity-75 disabled:opacity-40"
          >
            I applied
          </button>
        )}
        {award.myStatus === "applied" && (
          <span className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">They said:</span>
            <button type="button" disabled={busy} onClick={() => onStatus(award, "won")} className="press rounded-full bg-win/15 px-2.5 py-0.5 text-[11px] font-bold text-win hover:bg-win/25 disabled:opacity-40">
              Won it
            </button>
            <button type="button" disabled={busy} onClick={() => onStatus(award, "missed")} className="press rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-40">
              Not this time
            </button>
          </span>
        )}
        {award.myStatus === "won" && (
          <span className="text-[11px] font-semibold text-win">Get it in writing, then tell Ollie.</span>
        )}
        {!award.myStatus && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onHide(award)}
            className="press ml-auto text-[11px] text-muted-foreground/60 transition-[transform,color] hover:text-loss disabled:opacity-40"
          >
            Not for me
          </button>
        )}
      </div>
    </motion.li>
  );
}

// The Funding tab: top assessed awards, refreshed alongside the shortlist.
export function OllieFunding({ refreshKey, refreshing = false }: { refreshKey: number; refreshing?: boolean }) {
  const [view, setView] = useState<FundingView | null>(null);
  const [loading, startLoad] = useTransition();
  const [acting, startAct] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getFunding();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  // Ladder rung — optimistic, honest rollback.
  const onStatus = (award: FundingAward, status: FundingAward["myStatus"]) => {
    setView((v) => v && { ...v, awards: v.awards.map((a) => (a.id === award.id ? { ...a, myStatus: status } : a)) });
    startAct(async () => {
      const res = await setAwardStatus(award.id, status);
      if (!res.ok) {
        setView((v) => v && { ...v, awards: v.awards.map((a) => (a.id === award.id ? { ...a, myStatus: award.myStatus } : a)) });
      }
    });
  };

  // "Not for me" — the card collapses out; the decision is preserved and undoable.
  const onHide = (award: FundingAward) => {
    setView((v) => v && { ...v, awards: v.awards.filter((a) => a.id !== award.id) });
    startAct(async () => {
      const res = await hideAward(award.id);
      if (!res.ok) setView((v) => v && { ...v, awards: [...v.awards, award] });
    });
  };

  // Hand the open question to the chat pane: it drops a note turn and focuses
  // the input, so answering takes one keystroke, not a tab hunt.
  const onAnswer = (question: string) => {
    window.dispatchEvent(new CustomEvent("ollie:answer-hint", { detail: { hint: question } }));
  };

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

        {/* v3 funding hero: money feels FOUND, not begged for — and honest. */}
        {view?.ready && count > 0 && (view.totalUpTo ?? 0) > 0 && (
          <div className="mx-5 mt-4 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3">
            <p className="text-[10px] font-black uppercase text-gold">Matched to you so far</p>
            <p className="relative overflow-hidden text-2xl font-black tabular-nums text-foreground">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={view.totalUpTo}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="block"
                >
                  up to {money(view.totalUpTo!)}
                </motion.span>
              </AnimatePresence>
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Across {count} award{count === 1 ? "" : "s"} you may qualify for. Nothing is promised until it&apos;s
              in writing.
            </p>
          </div>
        )}

        {view && count === 0 && !busy && (
          <PanelEmpty
            title="No scholarships matched yet"
            body="Tell me about yourself in the chat — field, level, GPA, home state — and I'll surface awards you can actually get."
            hint="what scholarships can help me pay?"
          />
        )}

        <AnimatePresence>
          {count > 0 && (
            <ul className={`transition-opacity duration-300 ${busy ? "opacity-40" : "opacity-100"}`}>
              <AnimatePresence initial={false}>
                {view!.awards.map((a, i) => (
                  <Row key={a.id} award={a} index={i} onStatus={onStatus} onHide={onHide} onAnswer={onAnswer} busy={acting} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </AnimatePresence>

        {!view && busy && <PanelListSkeleton rows={4} />}
      </div>
    </div>
  );
}
