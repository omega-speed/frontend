"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askOllie } from "../service";
import type { OllieAnswer } from "../types";
import { OllieAnswerCard } from "./ollie-answer";

type Turn =
  | { role: "user"; text: string }
  | { role: "ollie"; answer: OllieAnswer }
  | { role: "error"; text: string };

const SUGGESTIONS = [
  "Where should I apply?",
  "What can I afford?",
  "What are my chances?",
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
              <OllieAnswerCard key={i} answer={turn.answer} />
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
