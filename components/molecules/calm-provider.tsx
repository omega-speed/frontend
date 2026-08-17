"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

// UX-001 · SEG-NEURO-000002 — Calm mode's reach into the MOTION ENGINE.
// CSS rules quiet CSS animations, but framer-motion is JavaScript-driven and
// ignores CSS: the typewriter, spring tabs, and ring sweeps kept moving with
// calm on. MotionConfig reducedMotion="always" stops transform/layout motion
// engine-wide; components with bespoke motion (TypeReveal) read useCalm().
const CalmContext = createContext(false);
export const useCalm = () => useContext(CalmContext);

export const CALM_EVENT = "qoollege-calm-change";

export function CalmProvider({ children }: { children: ReactNode }) {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const read = () => setCalm(document.documentElement.hasAttribute("data-calm"));
    read(); // the pre-paint script may have set it before hydration
    window.addEventListener(CALM_EVENT, read);
    return () => window.removeEventListener(CALM_EVENT, read);
  }, []);

  return (
    <CalmContext.Provider value={calm}>
      <MotionConfig reducedMotion={calm ? "always" : "user"}>{children}</MotionConfig>
    </CalmContext.Provider>
  );
}
