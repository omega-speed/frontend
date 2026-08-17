"use client";

import { motion } from "framer-motion";
import { useCalm } from "@/components/molecules/calm-provider";

// Typewriter reveal: characters appear in order — no movement, no bounce — with
// a soft blinking caret that disappears when the line is done. The answer is
// already complete server-side; this is purely presentation, so long texts
// speed up to finish within ~2.5s. Only used for FRESH turns.
export function TypeReveal({ text, className }: { text: string; className?: string }) {
  // Calm mode: the full line, instantly — the typewriter is opacity-delayed,
  // so even the reduced-motion engine setting would still "type" it.
  const calm = useCalm();
  if (calm) return <span className={className}>{text}</span>;
  const chars = [...text];
  const perChar = Math.min(0.022, 2.5 / Math.max(chars.length, 1));
  const total = chars.length * perChar;

  return (
    <span className={className} aria-label={text}>
      {chars.map((c, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * perChar, duration: 0.01 }}
        >
          {c}
        </motion.span>
      ))}
      <motion.span
        aria-hidden
        className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-0.5 rounded-full bg-primary align-baseline"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.55, repeat: Math.max(1, Math.ceil(total / 0.55)), repeatType: "reverse" }}
        exit={{ opacity: 0 }}
      />
    </span>
  );
}
