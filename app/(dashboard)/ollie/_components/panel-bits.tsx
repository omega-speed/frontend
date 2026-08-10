"use client";

import { Skeleton } from "@/components/ui/skeleton";

// Shared premium bits for the Ollie panel tabs: a list skeleton that mirrors
// the real rows (never a bare "Loading…" string) and a warm empty state that
// tells the learner exactly what this tab is for and how to fill it.

export function PanelListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="border-b border-border/70 px-5 py-4 last:border-b-0">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-56" />
          <Skeleton className="mt-1.5 h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

export function PanelEmpty({
  title,
  body,
  hint,
}: {
  title: string;
  body: string;
  hint?: string; // a chat phrase the learner can use right now
}) {
  return (
    <div className="px-5 py-8">
      <div className="glossy relative mx-auto max-w-sm rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
        {hint && (
          <p className="mt-3 inline-block rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
            Try: “{hint}”
          </p>
        )}
      </div>
    </div>
  );
}
