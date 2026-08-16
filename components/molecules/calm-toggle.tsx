"use client";

import { useEffect, useState } from "react";

// UX-001 · SEG-NEURO-000002/000009 — Calm mode: one tap turns off gloss,
// sheen, and decorative motion everywhere. The preference is the user's,
// persisted locally, applied before paint on later visits via the inline
// script in the root layout.
const KEY = "qoollege-calm";

export function applyCalm(on: boolean) {
  document.documentElement.toggleAttribute("data-calm", on);
}

export function CalmToggle() {
  const [calm, setCalm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY) === "1";
    setCalm(stored);
    applyCalm(stored);
  }, []);

  const toggle = () => {
    const next = !calm;
    setCalm(next);
    localStorage.setItem(KEY, next ? "1" : "0");
    applyCalm(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={calm}
      title="Calm mode turns off decorative motion and shine"
      className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
        calm
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {calm ? "Calm on" : "Calm"}
    </button>
  );
}
