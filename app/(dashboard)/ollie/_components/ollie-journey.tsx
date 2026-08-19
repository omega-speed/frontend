"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getJourney } from "../service";
import type { JourneyItem, JourneyView } from "../types";
import { WARM, WARM_SOFT } from "./ollie-theme";
import { PanelListSkeleton } from "./panel-bits";
import { TaskList } from "./task-list";

dayjs.extend(relativeTime);

const KIND: Record<JourneyItem["kind"], { label: string; color: string }> = {
  TASK: { label: "Do now", color: "var(--primary)" },
  DEADLINE: { label: "Deadline", color: "var(--gold)" },
  FUNDING: { label: "Money", color: "var(--win)" },
};

function when(item: JourneyItem): string | null {
  if (!item.date) return null;
  const d = dayjs(item.date);
  return `${d.format("MMM D, YYYY")} · ${d.fromNow()}${item.projected ? " · projected" : ""}`;
}

function Row({ item, index }: { item: JourneyItem; index: number }) {
  const k = KIND[item.kind];
  const timing = when(item);
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.04 }}
      className="border-b border-border/70 px-5 py-3.5 last:border-b-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 text-[14px] font-semibold leading-snug text-foreground">
          {item.institutionId ? (
            <Link href={`/schools/${item.institutionId}`} className="transition-colors hover:text-primary">
              {item.school ? `${item.school} — ${item.title}` : item.title}
            </Link>
          ) : item.school ? (
            `${item.school} — ${item.title}`
          ) : (
            item.title
          )}
        </h3>
        <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: k.color }}>
          <span className="size-1.5 rounded-full" style={{ background: k.color }} aria-hidden />
          {k.label}
        </span>
      </div>
      {timing && (
        <p className="mt-0.5 text-xs font-medium" style={item.urgent ? { color: WARM } : undefined}>
          <span className={item.urgent ? "" : "text-muted-foreground"}>{timing}</span>
          {item.urgent ? " — coming up fast" : ""}
        </p>
      )}
      {item.detail && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>}
    </motion.li>
  );
}

// The Plan tab: one dated timeline — do-now tasks, then every real deadline for
// the schools in focus and the money worth chasing.
// The board half of the ONE task system: everything you added — here and on
// application cards — checkable in one place, with progress you can feel.
function TaskBoard({ refreshKey }: { refreshKey: number }) {
  return (
    <div className="mx-4 mt-3 rounded-2xl border border-border bg-card p-4">
      <TaskList
        title="Your tasks"
        showProgress
        placeholder="Add a task — anything on your mind"
        refreshKey={refreshKey}
      />
    </div>
  );
}

export function OllieJourney({ refreshKey, refreshing = false }: { refreshKey: number; refreshing?: boolean }) {
  const [view, setView] = useState<JourneyView | null>(null);
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const res = await getJourney();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  const busy = refreshing || loading;
  const items = view?.items ?? [];
  const pinned = view?.focus.filter((f) => f.pinned) ?? [];

  return (
    <div className="flex h-full flex-col bg-background/40">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-sm text-muted-foreground">
          {view
            ? pinned.length > 0
              ? `Your plan for ${pinned.map((f) => f.name).join(", ")}`
              : items.length > 0
                ? "Your plan — pin schools to focus it"
                : "Nothing planned yet"
            : "Building your plan"}
        </p>
        {busy && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: WARM }}>
            <span className="size-1.5 animate-pulse rounded-full" style={{ background: WARM }} />
            updating
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <TaskBoard refreshKey={refreshKey} />
        {busy && view && (
          <div className="mx-5 mt-4 rounded-xl px-3.5 py-2.5 text-sm font-medium" style={{ background: WARM_SOFT, color: WARM }}>
            Rebuilding your plan…
          </div>
        )}

        {view && items.length === 0 && !busy && (
          <p className="px-5 py-6 text-sm leading-relaxed text-muted-foreground">
            Tell me about yourself in the chat, then pin the schools you&apos;re serious about — I&apos;ll stack their real
            deadlines and the money worth chasing into one plan.
          </p>
        )}

        {items.length > 0 && (
          <ul className={`transition-opacity duration-300 ${busy ? "opacity-40" : "opacity-100"}`}>
            {items.map((item, i) => (
              <Row key={`${item.kind}-${item.title}-${item.school ?? ""}-${item.date ?? ""}`} item={item} index={i} />
            ))}
          </ul>
        )}

        {!view && busy && <PanelListSkeleton rows={4} />}
      </div>
    </div>
  );
}
