"use client";

import { useEffect, useState, useTransition } from "react";
import { PanelListSkeleton } from "./panel-bits";
import { motion } from "framer-motion";
import { getAbout } from "../service";
import type { AboutFact, AboutView } from "../types";

function FactList({ facts }: { facts: AboutFact[] }) {
  return (
    <ul className="space-y-2">
      {facts.map((f, i) => (
        <motion.li
          key={`${f.label}-${i}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: i * 0.04 }}
          className="text-sm leading-snug"
        >
          <span className="text-muted-foreground">{f.label}</span>{" "}
          <span className="font-medium text-foreground">{f.value}</span>
        </motion.li>
      ))}
    </ul>
  );
}

// What Ollie knows about the learner — split honestly into what's shaping the
// shortlist and what's captured but not yet influencing it. The learner can then
// tell Ollie in the chat to factor something in.
export function OllieAbout({ refreshKey }: { refreshKey: number }) {
  const [view, setView] = useState<AboutView | null>(null);
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getAbout();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  const empty = view && view.using.length === 0 && view.noted.length === 0;

  const meter = view?.completeness;

  return (
    <div className="flex h-full flex-col">
      {meter && !empty && (
        <div className="px-4 pt-3">
          <div
            className="glossy relative overflow-hidden rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.3 0.09 300), oklch(0.24 0.05 300))" }}
          >
            <p className="text-sm font-semibold">Your profile so far</p>
            <p className="mt-0.5 text-[11px] text-white/60">Built from your chats with Ollie</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${meter.percent}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-[11px] text-white/80">
              <span className="font-bold text-gold">{meter.percent}% complete.</span> {meter.nextHint}
            </p>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {!view && loading && <PanelListSkeleton rows={3} />}

        {empty && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            I don&apos;t know anything about you yet — tell me about your studies, budget, or what you&apos;re
            looking for and it&apos;ll show up here.
          </p>
        )}

        {view && !empty && (
          <div className="space-y-6">
            {view.using.length > 0 && (
              <section>
                <p className="text-[11px] font-black uppercase text-primary">Shaping your shortlist</p>
                <p className="mt-1 mb-3 text-xs leading-relaxed text-muted-foreground">
                  These are what I&apos;m weighing right now.
                </p>
                <FactList facts={view.using} />
              </section>
            )}

            {view.noted.length > 0 && (
              <section>
                <p className="text-[11px] font-black uppercase text-muted-foreground">Also noted</p>
                <p className="mt-1 mb-3 text-xs leading-relaxed text-muted-foreground">
                  I&apos;ve got these but they&apos;re not shaping your list yet. If one should, just tell me in
                  the chat.
                </p>
                <FactList facts={view.noted} />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
