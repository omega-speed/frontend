"use client";

import { use, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { askOllie, confirmDeclare, decideOllieAction, undoDeclare } from "../service";
import type { ConversationMessage, Declaration, OllieAnswer } from "../types";
import { OllieAnswerCard } from "./ollie-answer";
import { OllieThinking } from "./ollie-thinking";
import { OllieMark } from "./ollie-mark";
import { SavedReceipt } from "./saved-receipt";

type Turn =
  | { role: "user"; text: string }
  | { role: "ollie"; answer: OllieAnswer; resolved?: boolean }
  | { role: "note"; text: string }
  | { role: "error"; text: string };

const SUGGESTIONS = [
  "Where should I apply?",
  "I'm undecided — help me explore",
  "What can I afford?",
  "What do you know about me?",
];

// Rehydrate the saved transcript into turns. Past Ollie turns are marked resolved
// so their one-time controls (Save / Undo) don't reappear on reload.
function seedTurns(messages: ConversationMessage[]): Turn[] {
  const turns: Turn[] = [];
  for (const m of messages) {
    if (m.role === "USER" && m.text) turns.push({ role: "user", text: m.text });
    else if (m.role === "OLLIE" && m.answer) turns.push({ role: "ollie", answer: m.answer, resolved: true });
  }
  return turns;
}

export function AskOllie({
  onActivity,
  conversationPromise,
}: {
  onActivity?: () => void;
  conversationPromise: Promise<ConversationMessage[]>;
}) {
  // Unwrap the streamed transcript. `use()` suspends only this pane until it lands
  // (the shortlist panel is already interactive), then seeds the thread once.
  const initialMessages = use(conversationPromise);
  const [turns, setTurns] = useState<Turn[]>(() => seedTurns(initialMessages));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToEnd = () =>
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));

  function grow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 176)}px`;
  }

  // The "thinking…" indicator is driven by an explicit `busy` flag, deliberately
  // NOT useTransition: a saving turn calls onActivity() to refresh the side panel,
  // and inside a transition that parent update would keep the transition pending
  // until the panel's slow refetch finished — leaving a phantom "thinking…" after
  // Ollie already replied. `busy` clears the instant the answer is appended.
  async function send(message: string) {
    const text = message.trim();
    if (!text || busy) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setTurns((t) => [...t, { role: "user", text }]);
    scrollToEnd();
    setBusy(true);
    try {
      const res = await askOllie(text);
      setTurns((t) => [...t, res.ok ? { role: "ollie", answer: res.answer } : { role: "error", text: res.message }]);
      // Refresh the panels ONLY when the turn changed something the matcher
      // actually scores on — "no location in mind" saves quietly, no 30s re-score.
      if (res.ok && res.answer.scoringChanged) onActivity?.();
    } finally {
      setBusy(false);
      scrollToEnd();
    }
  }

  // Mark an interactive turn (proposal) resolved so its controls disappear.
  function resolveAt(index: number) {
    setTurns((t) =>
      t.map((turn, i) => (i === index && turn.role === "ollie" ? { ...turn, resolved: true } : turn)),
    );
  }

  async function save(index: number, proposals: Declaration[]) {
    if (busy) return;
    resolveAt(index);
    setBusy(true);
    try {
      const res = await confirmDeclare(proposals);
      setTurns((t) => [
        ...t,
        res.ok ? { role: "ollie", answer: res.answer } : { role: "error", text: res.message },
      ]);
      onActivity?.(); // response is in — refresh the shortlist / About panels now
    } finally {
      setBusy(false);
      scrollToEnd();
    }
  }

  // OL-006: the learner's explicit yes/no to a proposed consequential action.
  async function decide(index: number, actionId: string, decision: "confirm" | "decline") {
    if (busy) return;
    resolveAt(index);
    setBusy(true);
    try {
      const res = await decideOllieAction(actionId, decision);
      setTurns((t) => [...t, res.ok ? { role: "ollie", answer: res.answer } : { role: "error", text: res.message }]);
      if (decision === "confirm") onActivity?.(); // something real changed — refresh panels
    } finally {
      setBusy(false);
      scrollToEnd();
    }
  }

  function cancel(index: number) {
    resolveAt(index);
    setTurns((t) => [...t, { role: "note", text: "No problem — I didn't change anything." }]);
  }

  // Reverse ONE auto-saved fact (receipt chip ✕) — quiet, no new chat turn.
  async function undoOne(declaration: Declaration) {
    try {
      await undoDeclare([declaration]);
      onActivity?.();
    } catch {
      // the chip stays removed locally; the panel refresh will reconcile
    }
  }


  const empty = turns.length === 0 && !busy;

  return (
    <div className="relative flex h-full flex-col">
      {/* warm ambient wash — subtle, top-anchored */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72"
        style={{ background: "radial-gradient(60% 100% at 50% 0%, color-mix(in oklab, var(--brand) 9%, transparent), transparent)" }}
      />
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 text-center"
          >
            <div className="relative">
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -z-10 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--brand) 30%, transparent), color-mix(in oklab, oklch(0.66 0.24 320) 18%, transparent), transparent 70%)" }}
              />
              <OllieMark size={64} />
            </div>
            <h1 className="mt-5 text-2xl font-semibold leading-tight text-foreground text-balance sm:text-3xl">
              Hey — I&apos;m{" "}
              <span className="bg-linear-to-r from-primary to-[oklch(0.66_0.24_320)] bg-clip-text text-transparent">Ollie</span>.
              Let&apos;s find where you belong.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Tell me what you&apos;re into, what you can spend, and what matters to you — I&apos;ll build
              your shortlist as we talk and show you exactly why each school made it.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s, i) => (
                <motion.button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
                  className="press press-lift rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground shadow-sm transition-[transform,border-color,color,box-shadow] hover:border-primary/40 hover:text-primary hover:shadow-md"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6">
            {turns.map((turn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                {turn.role === "user" ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-3xl rounded-br-lg bg-primary px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-[0_4px_16px_-6px_color-mix(in_oklab,var(--brand)_45%,transparent)]">
                      {turn.text}
                    </div>
                  </div>
                ) : turn.role === "ollie" ? (
                  <div className="space-y-3">
                    <OllieAnswerCard answer={turn.answer} fresh={!turn.resolved} />
                    {/* SENSITIVE change — explicit confirm */}
                    {turn.answer.proposals && turn.answer.proposals.length > 0 && !turn.resolved && (
                      <div className="flex gap-2 pl-10">
                        <button
                          type="button"
                          onClick={() => save(i, turn.answer.proposals!)}
                          disabled={busy}
                          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                          Save to my profile
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel(i)}
                          disabled={busy}
                          className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          Not now
                        </button>
                      </div>
                    )}
                    {/* OL-006: consequential action — nothing happens without this yes */}
                    {turn.answer.pendingAction && !turn.resolved && (
                      <div className="flex gap-2 pl-10">
                        <button
                          type="button"
                          onClick={() => decide(i, turn.answer.pendingAction!.actionId, "confirm")}
                          disabled={busy}
                          className="cta-btn rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                          Yes, do it
                        </button>
                        <button
                          type="button"
                          onClick={() => decide(i, turn.answer.pendingAction!.actionId, "decline")}
                          disabled={busy}
                          className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          Not now
                        </button>
                      </div>
                    )}
                    {/* suggested next moves — taps derived from real gaps */}
                    {!turn.resolved && turn.answer.suggestions && turn.answer.suggestions.length > 0 && i === turns.length - 1 && (
                      <div className="flex flex-wrap gap-1.5 pl-10">
                        {turn.answer.suggestions.map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            disabled={busy}
                            onClick={() => send(sug)}
                            className="press press-lift rounded-full border border-primary/25 bg-card px-3 py-1 text-xs text-primary transition-[transform,border-color,box-shadow] hover:border-primary/50 hover:shadow-sm disabled:opacity-40"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* auto-saved — the receipt: expandable, grouped, per-chip removable */}
                    {turn.answer.saved && turn.answer.saved.length > 0 && !turn.resolved && (
                      <SavedReceipt
                        saved={turn.answer.saved}
                        busy={busy}
                        onRemove={async (d) => {
                          await undoOne(d);
                        }}
                      />
                    )}
                  </div>
                ) : turn.role === "note" ? (
                  <p className="pl-10 text-sm text-muted-foreground">{turn.text}</p>
                ) : (
                  <p className="pl-10 text-sm text-loss">{turn.text}</p>
                )}
              </motion.div>
            ))}

            <AnimatePresence>
              {busy && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OllieThinking />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="glossy flex items-end gap-2 rounded-full border border-border bg-card px-4 py-2.5 shadow-[0_2px_16px_-6px_color-mix(in_oklab,var(--brand)_20%,transparent)] transition-all duration-300 focus-within:border-primary/60 focus-within:shadow-[0_8px_28px_-8px_color-mix(in_oklab,var(--brand)_35%,transparent)]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                grow(e.currentTarget);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask Ollie anything — where to apply, what you can afford, your chances…"
              rows={1}
              className="max-h-44 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send"
              style={{ background: "linear-gradient(135deg, var(--primary), oklch(0.66 0.24 320))" }}
              className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:opacity-30"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Ollie shows its thinking and is honest about what it doesn&apos;t know.
          </p>
        </form>
      </div>
    </div>
  );
}
