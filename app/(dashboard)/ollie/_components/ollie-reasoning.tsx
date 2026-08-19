"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { OllieAnswer } from "../types";

// Turn a domain key like "Q_MATCH" into "Q-Match".
function domainLabel(domain: string): string {
  const cleaned = domain.replace(/_/g, "-").toLowerCase();
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase()).replace(/^Q-/, "Q-");
}

// Ollie's actual thought process for this turn — not a canned script. It reflects
// how the message was interpreted and the concrete steps the orchestrator ran
// (each domain, what it did, and why). Collapsed by default, like a reasoning trace.
export function OllieReasoning({ answer }: { answer: OllieAnswer }) {
  const [open, setOpen] = useState(false);
  const { interpreted, plan } = answer;
  const steps = plan?.steps ?? [];
  const domains = plan?.requiredDomains ?? [];

  // Nothing meaningful to show (e.g. a plain greeting) — skip the disclosure.
  if (!interpreted?.rationale && steps.length === 0 && domains.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="press flex items-center gap-1.5 text-[11px] font-black uppercase text-muted-foreground transition-[transform,color] hover:text-primary"
        aria-expanded={open}
      >
<ChevronRight className={`size-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`} strokeWidth={2.5} aria-hidden />
        {open ? "Hide thought process" : "Show thought process"}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-3 border-l-2 border-border pl-3.5 text-sm">
              {interpreted?.outcome && (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black uppercase text-muted-foreground">
                    How I read this
                  </p>
                  <p className="leading-relaxed text-foreground">{interpreted.outcome}</p>
                  {interpreted.rationale && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {interpreted.rationale}
                    </p>
                  )}
                </div>
              )}

              {steps.length > 0 ? (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black uppercase text-muted-foreground">
                    What I did
                  </p>
                  <ol className="space-y-1.5">
                    {steps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 leading-relaxed">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                        <span>
                          <span className="font-semibold">{domainLabel(s.domain)}</span>
                          {s.action ? <> — {s.action}</> : null}
                          {s.reason ? (
                            <span className="text-muted-foreground"> · {s.reason}</span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                domains.length > 0 && (
                  <p className="leading-relaxed text-muted-foreground">
                    Consulted {domains.map(domainLabel).join(", ")}.
                  </p>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
