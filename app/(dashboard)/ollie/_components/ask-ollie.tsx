"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askOllie, confirmDeclare } from "../service";
import type { Declaration, OllieAnswer } from "../types";
import { OllieAnswerCard } from "./ollie-answer";

type Turn =
  | { role: "user"; text: string }
  | { role: "ollie"; answer: OllieAnswer; resolved?: boolean }
  | { role: "note"; text: string }
  | { role: "error"; text: string };

const SUGGESTIONS = [
  "Where should I apply?",
  "What scholarships can help?",
  "My GPA is 3.9",
  "What do you know about me?",
];

export function AskOllie() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  function send(message: string) {
    const text = message.trim();
    if (!text || pending) return;
    setInput("");
    setTurns((t) => [...t, { role: "user", text }]);
    startTransition(async () => {
      const res = await askOllie(text);
      setTurns((t) => [
        ...t,
        res.ok ? { role: "ollie", answer: res.answer } : { role: "error", text: res.message },
      ]);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
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
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
    });
  }

  function cancel(index: number) {
    resolveAt(index);
    setTurns((t) => [...t, { role: "note", text: "No problem — I didn't change anything." }]);
  }

  return (
    <div className="space-y-5">
      {turns.length === 0 ? (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-sm px-3 py-1.5 border border-border bg-card hover:bg-accent transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {turns.map((turn, i) =>
            turn.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] bg-primary/10 border border-primary/20 px-3 py-2">
                  <p className="text-sm leading-relaxed">{turn.text}</p>
                </div>
              </div>
            ) : turn.role === "ollie" ? (
              <div key={i} className="space-y-2">
                <OllieAnswerCard answer={turn.answer} />
                {turn.answer.proposals && turn.answer.proposals.length > 0 && !turn.resolved && (
                  <div className="flex gap-2">
                    <Button onClick={() => save(i, turn.answer.proposals!)} disabled={pending}>
                      Save to my profile
                    </Button>
                    <Button variant="ghost" onClick={() => cancel(i)} disabled={pending}>
                      Not now
                    </Button>
                  </div>
                )}
              </div>
            ) : turn.role === "note" ? (
              <p key={i} className="text-sm text-muted-foreground">{turn.text}</p>
            ) : (
              <p key={i} className="text-sm text-loss">{turn.text}</p>
            ),
          )}
          {pending && <p className="text-sm text-muted-foreground">Ollie is thinking…</p>}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="space-y-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Ask Ollie anything about where to apply, what you can afford, or your chances…"
          rows={2}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={pending || !input.trim()}>
            {pending ? "Thinking…" : "Ask Ollie"}
          </Button>
        </div>
      </form>
    </div>
  );
}
