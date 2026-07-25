"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { askOllie, confirmDeclare } from "../service";
import type { Declaration, OllieAnswer } from "../types";
import { OllieAnswerCard } from "./ollie-answer";
import { OllieThinking } from "./ollie-thinking";

type Turn =
  | { role: "user"; text: string }
  | { role: "ollie"; answer: OllieAnswer; resolved?: boolean }
  | { role: "note"; text: string }
  | { role: "error"; text: string };

const SUGGESTIONS = [
  "Where should I apply?",
  "What can I afford?",
  "I'm doing a master's in computer science",
  "What do you know about me?",
];

export function AskOllie() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToEnd = () =>
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));

  useEffect(() => {
    if (pending) scrollToEnd();
  }, [pending]);

  function grow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 176)}px`;
  }

  function send(message: string) {
    const text = message.trim();
    if (!text || pending) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setTurns((t) => [...t, { role: "user", text }]);
    startTransition(async () => {
      const res = await askOllie(text);
      setTurns((t) => [
        ...t,
        res.ok ? { role: "ollie", answer: res.answer } : { role: "error", text: res.message },
      ]);
      scrollToEnd();
    });
  }

  // Mark the proposing turn resolved so its buttons disappear, whatever the choice.
  function resolveAt(index: number) {
    setTurns((t) =>
      t.map((turn, i) => (i === index && turn.role === "ollie" ? { ...turn, resolved: true } : turn)),
    );
  }

  function save(index: number, proposals: Declaration[]) {
    if (pending) return;
    resolveAt(index);
    startTransition(async () => {
      const res = await confirmDeclare(proposals);
      setTurns((t) => [
        ...t,
        res.ok ? { role: "ollie", answer: res.answer } : { role: "error", text: res.message },
      ]);
      scrollToEnd();
    });
  }

  function cancel(index: number) {
    resolveAt(index);
    setTurns((t) => [...t, { role: "note", text: "No problem — I didn't change anything." }]);
  }

  const empty = turns.length === 0 && !pending;

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
            <span className="text-[11px] font-black uppercase text-primary">Ollie</span>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              Where should we start?
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Tell me what you&apos;re weighing — where to apply, what you can afford, your
              chances — and I&apos;ll pull it together and show you how I got there.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
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
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary/10 px-3.5 py-2 text-sm leading-relaxed">
                      {turn.text}
                    </div>
                  </div>
                ) : turn.role === "ollie" ? (
                  <div className="space-y-3">
                    <OllieAnswerCard answer={turn.answer} />
                    {turn.answer.proposals && turn.answer.proposals.length > 0 && !turn.resolved && (
                      <div className="flex gap-2 pl-10">
                        <button
                          type="button"
                          onClick={() => save(i, turn.answer.proposals!)}
                          disabled={pending}
                          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                        >
                          Save to my profile
                        </button>
                        <button
                          type="button"
                          onClick={() => cancel(i)}
                          disabled={pending}
                          className="rounded-full px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                        >
                          Not now
                        </button>
                      </div>
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
              {pending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <OllieThinking />
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto w-full max-w-3xl"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card px-3 py-2 transition-colors focus-within:border-primary/50">
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
              placeholder="Ask Ollie anything about where to apply, what you can afford, or your chances…"
              rows={1}
              className="max-h-44 flex-1 resize-none bg-transparent py-1.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
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
