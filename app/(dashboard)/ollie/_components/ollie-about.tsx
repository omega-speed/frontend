"use client";

import { useEffect, useState, useTransition } from "react";
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

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-5">
        {!view && loading && <p className="text-sm text-muted-foreground">Gathering what I know…</p>}

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
