"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { OllieMark } from "./ollie-mark";

// The real phases every Ollie turn goes through: interpret the message → read the
// twin → run the domain(s) → synthesize. Shown one at a time while the request is
// in flight. These are honest activity labels, not fabricated reasoning — the
// specific reasoning is revealed on the answer itself once it returns.
const PHASES = [
  "Reading your message",
  "Checking what I already know about you",
  "Thinking it through",
  "Putting your answer together",
];

export function OllieThinking() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setStep((s) => Math.min(s + 1, PHASES.length - 1)),
      900,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-start gap-3">
      <OllieMark thinking />
      <div className="space-y-2 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase text-primary">Ollie</span>
          <span className="text-xs text-muted-foreground">thinking…</span>
        </div>
        <ul className="space-y-1.5">
          {PHASES.slice(0, step + 1).map((phase, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <motion.li
                key={phase}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className={
                    done
                      ? "size-1.5 rounded-full bg-primary"
                      : "size-1.5 rounded-full bg-primary/50 animate-pulse"
                  }
                />
                <span className={current ? "text-foreground" : "text-muted-foreground"}>
                  {phase}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Compact three-dot pulse for non-matching turns (a greeting, a profile note) where
// the staged phase list would overclaim work that isn't happening.
export function OllieTyping() {
  return (
    <div className="flex items-center gap-3">
      <OllieMark thinking />
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-muted-foreground/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </div>
  );
}
