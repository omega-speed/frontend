"use client";

import { motion } from "framer-motion";

// Streamed-feel text: words arrive one after another with a soft, springy pop —
// the answer is already complete (deterministic + voiced server-side); this is
// purely presentation. Only used for FRESH turns; history renders instantly.
export function TypeReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(/(\s+)/);
  let wordIndex = 0;
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => {
        if (/^\s+$/.test(w)) return <span key={i}>{w}</span>;
        const delay = Math.min(wordIndex++ * 0.028, 2.2);
        return (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 7, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 380, damping: 24, mass: 0.6 }}
          >
            {w}
          </motion.span>
        );
      })}
    </span>
  );
}
