"use client";

import { motion } from "framer-motion";

import { OLLIE_GRADIENT } from "./ollie-theme";

// Ollie's mark — a living gradient orb (purple → violet-pink), not a static
// icon. It breathes gently, and pulses faster while thinking. This is Ollie's
// face; the one place we let the identity be vivid.
const GRADIENT = OLLIE_GRADIENT;

export function OllieMark({ thinking = false, size = 28 }: { thinking?: boolean; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {/* soft aura */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{ background: GRADIENT, filter: "blur(7px)" }}
        animate={{ opacity: thinking ? [0.35, 0.7, 0.35] : [0.25, 0.4, 0.25] }}
        transition={{ duration: thinking ? 1.2 : 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        className="relative inline-flex items-center justify-center rounded-full"
        style={{ width: size, height: size, background: GRADIENT }}
        animate={{ scale: thinking ? [1, 1.1, 1] : [1, 1.04, 1] }}
        transition={{ duration: thinking ? 1.2 : 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="rounded-full bg-white/85" style={{ width: size * 0.26, height: size * 0.26 }} />
      </motion.span>
    </span>
  );
}
