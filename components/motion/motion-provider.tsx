"use client";

import { MotionConfig } from "framer-motion";
import { ReactNode } from "react";

// One switch for ALL Framer Motion in the app: `reducedMotion="user"` makes
// every spring/slide collapse to an opacity change when the OS asks for
// reduced motion — the CSS side is already handled in globals.css (UX-001).
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
