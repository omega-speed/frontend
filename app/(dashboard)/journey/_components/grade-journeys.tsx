"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CornerAccents } from "@/components/ui/corner-accents";
import type { TrackedApplication } from "../../ollie/types";
import type { EssayListItem } from "../../essays/types";
import { SeniorJourney } from "./senior-journey";

// UX-003/UX-004/UX-005 — one journey page, stage-aware. Earlier grades get
// exploration and groundwork WITHOUT application pressure (SEG-FRESH/SEG-SOPH:
// no premature deadlines); junior year turns toward strategy; senior year runs
// the season. The learner picks their stage — we never guess it for them.

type Stage = "freshman" | "sophomore" | "junior" | "senior";
const STAGES: { key: Stage; label: string }[] = [
  { key: "freshman", label: "Freshman" },
  { key: "sophomore", label: "Sophomore" },
  { key: "junior", label: "Junior" },
  { key: "senior", label: "Senior" },
];

function Card({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative border border-border bg-card"
    >
      <CornerAccents />
      <div className="border-b border-border px-5 py-3">
        <p className="text-[11px] font-black uppercase text-primary">{kicker}</p>
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
      </div>
      <div className="px-5 py-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </motion.section>
  );
}

const ask = (q: string) => (
  <Link href="/ollie" className="font-semibold text-primary">
    “{q}”
  </Link>
);

function FreshmanSophomore({ stage }: { stage: "freshman" | "sophomore" }) {
  return (
    <div className="flex flex-col gap-5">
      <Card kicker="This year" title="Explore — nothing to apply to yet, on purpose">
        <p>
          No deadlines live here yet, and that’s right for this year. The work now is noticing what you actually enjoy —
          classes, clubs, problems you like solving. Tell Ollie as you go: {ask("I'm into robotics")} — every interest you
          share sharpens everything later.
        </p>
      </Card>
      <Card kicker="Courses" title="Build the foundation">
        <p>
          Take the strongest courses you can handle well — depth beats a padded list. Your GPA starts counting now, but
          it measures growth, not worth. Curious how grades connect to schools?{" "}
          {ask("what GPA do colleges look for?")}
        </p>
      </Card>
      <Card kicker="Activities" title="Try things — then go deep on a few">
        <p>
          {stage === "freshman" ? "Sample widely this year." : "Start narrowing to what you'd lead."} Colleges read
          commitment, not collection. Playing a sport? {ask("where could I play my sport in college?")} — it’s never too
          early to see the map.
        </p>
      </Card>
      <Card kicker="Looking ahead" title="A gentle first look">
        <p>
          Browse the{" "}
          <Link href="/schools" className="font-semibold text-primary">
            school catalog
          </Link>{" "}
          like a menu, not a test. If a school makes you curious, pin it — lists change, and that’s the point.
        </p>
      </Card>
    </div>
  );
}

function Junior() {
  return (
    <div className="flex flex-col gap-5">
      <Card kicker="This year" title="Strategy year — build the list that fits YOU">
        <p>
          Junior year turns exploration into a plan. Ask {ask("where should I apply?")} and work the shortlist until the
          balance feels honest: likely admits you’d love, targets, and a reach or two. The list lives in your{" "}
          <Link href="/ollie" className="font-semibold text-primary">
            Ollie panel
          </Link>
          .
        </p>
      </Card>
      <Card kicker="Money" title="Start the funding hunt early">
        <p>
          Scholarships reward early starters — many junior-year deadlines exist. Ask {ask("what scholarships can help me pay?")}{" "}
          and watch the Funding tab. Money shapes the list as much as grades do; that’s planning, not defeat.
        </p>
      </Card>
      <Card kicker="Testing" title="Plan tests around YOUR schools">
        <p>
          Check each pinned school’s test policy on its page — many are test-optional. If you’ll test, leave room for a
          retake before senior fall. Ask {ask("do my schools require test scores?")}
        </p>
      </Card>
      <Card kicker="Groundwork" title="Summer-before-senior setup">
        <p>
          Before senior year: visit or virtually tour your top schools, think about who’d write your recommendations, and
          start noticing stories worth telling — the{" "}
          <Link href="/essays" className="font-semibold text-primary">
            essay workspace
          </Link>{" "}
          keeps a story bank. Senior-you will be grateful.
        </p>
      </Card>
    </div>
  );
}

export function GradeJourneys({
  initialApps,
  initialEssays,
  onReloadAction,
}: {
  initialApps: TrackedApplication[];
  initialEssays: EssayListItem[];
  onReloadAction: () => Promise<{ apps: TrackedApplication[]; essays: EssayListItem[] }>;
}) {
  // The learner picks their stage each visit — trackers present means they're
  // clearly in the season, so senior is the default; otherwise junior (the
  // planning year) is the most useful landing.
  const [stage, setStage] = useState<Stage>(initialApps.length > 0 ? "senior" : "junior");
  const pick = setStage;

  return (
    <div>
      <div className="mb-5 flex border-b border-border">
        {STAGES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => pick(s.key)}
            className={`relative px-4 py-2.5 text-[11px] font-black uppercase transition-colors ${
              stage === s.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
            {stage === s.key && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" aria-hidden />}
          </button>
        ))}
      </div>

      {stage === "freshman" || stage === "sophomore" ? (
        <FreshmanSophomore stage={stage} />
      ) : stage === "junior" ? (
        <Junior />
      ) : (
        <SeniorJourney initialApps={initialApps} initialEssays={initialEssays} onReloadAction={onReloadAction} />
      )}
    </div>
  );
}
