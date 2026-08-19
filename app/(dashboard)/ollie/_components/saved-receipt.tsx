"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Declaration } from "../types";

// The receipt: "Saved N details to your profile" — one quiet line in the chat
// that expands into grouped, HUMAN-phrased chips. Every chip is removable (✕ =
// per-fact undo): the student owns their profile, and trust in that ownership
// is what keeps them feeding it.

const GROUPS: { key: string; label: string; match: (d: Declaration) => boolean }[] = [
  { key: "about", label: "About you", match: (d) => d.category === "academic" || d.category === "background" },
  { key: "interests", label: "Activities & interests", match: (d) => d.category === "interest" },
  { key: "fit", label: "What fits you", match: (d) => d.category === "preference" || d.category === "financial" },
];

function chipText(d: Declaration): string {
  const label = d.label ?? `${d.name}: ${String(d.value)}`;
  const [left, right] = label.split("→").map((x) => x?.trim());
  if (!right) return label;
  // "GPA → 3.8" reads as "GPA 3.8"; pure-value chips ("Field → still exploring")
  // read as just the value when the left side is generic.
  return ["Field", "Interest", "Activity"].includes(left) ? right : `${left}: ${right}`;
}

export function SavedReceipt({
  saved,
  onRemove,
  busy,
}: {
  saved: Declaration[];
  onRemove: (d: Declaration) => Promise<void>;
  busy?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  const keyOf = (d: Declaration) => `${d.category}/${d.name}/${String(d.value)}`;
  const remaining = saved.filter((d) => !removed.has(keyOf(d)));
  if (remaining.length === 0) return <p className="pl-10 text-xs text-muted-foreground">Removed — nothing kept.</p>;

  const remove = (d: Declaration) => {
    setRemoved((r) => new Set(r).add(keyOf(d)));
    startTransition(async () => {
      await onRemove(d);
    });
  };

  const grouped = GROUPS.map((g) => ({ ...g, items: remaining.filter(g.match) })).filter((g) => g.items.length > 0);
  const ungrouped = remaining.filter((d) => !GROUPS.some((g) => g.match(d)));

  return (
    <div className="ml-10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="press glossy inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary transition-[transform,border-color] hover:border-primary/50"
      >
        <span className="flex size-3.5 items-center justify-center rounded-full bg-win/15 text-[9px] text-win">✓</span>
        Saved {remaining.length} detail{remaining.length === 1 ? "" : "s"} to your profile
        <ChevronDown className={`size-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} strokeWidth={2.5} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.16, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-border bg-card p-4">
              {[...grouped, ...(ungrouped.length ? [{ key: "other", label: "Also noted", items: ungrouped }] : [])].map(
                (g) => (
                  <div key={g.key} className="mb-3 last:mb-0">
                    <p className="mb-1.5 text-[10px] font-black uppercase text-muted-foreground">{g.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {g.items.map((d) => (
                        <span
                          key={keyOf(d)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                        >
                          {chipText(d)}
                          <button
                            type="button"
                            aria-label={`Remove ${chipText(d)}`}
                            disabled={busy}
                            onClick={() => remove(d)}
                            className="text-[10px] text-muted-foreground transition-colors hover:text-loss disabled:opacity-40"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ),
              )}
              <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-[11px]">
                <Link href="/ollie?panel=about" className="font-semibold text-primary hover:opacity-80">
                  Open my full profile
                </Link>
                <span className="text-muted-foreground">You can change any of this, anytime</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
