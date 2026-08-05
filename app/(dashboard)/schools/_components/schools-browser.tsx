"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CornerAccents } from "@/components/ui/corner-accents";
import { cn } from "@/lib/utils";
import type { BrowseFilters, BrowseResult } from "../types";
import { admitPct, money, pct, titleCase } from "../_lib/format";

const SETTINGS = ["urban", "suburban", "town", "rural"] as const;
const SIZES = ["small", "medium", "large"] as const;
const SORTS = [
  { value: "name", label: "Name" },
  { value: "outcomes", label: "Best outcomes" },
  { value: "price", label: "Lowest net price" },
  { value: "selectivity", label: "Most selective" },
] as const;

const selectClass =
  "h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

// Client half of the browse page: edits the URL, the server refetches. Also holds
// the compare basket (up to 4 schools → /schools/compare).
export function SchoolsBrowser({ result, filters }: { result: BrowseResult; filters: BrowseFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search ?? "");
  const [stateCode, setStateCode] = useState(filters.state ?? "");
  const [picked, setPicked] = useState<{ id: string; name: string }[]>([]);

  const apply = (patch: Partial<BrowseFilters>) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    const q = new URLSearchParams();
    if (next.search) q.set("q", next.search);
    if (next.state) q.set("state", next.state);
    if (next.setting) q.set("setting", next.setting);
    if (next.size) q.set("size", next.size);
    if (next.sort) q.set("sort", next.sort);
    if ((next.page ?? 1) > 1) q.set("page", String(next.page));
    router.replace(q.toString() ? `${pathname}?${q}` : pathname);
  };

  const togglePick = (id: string, name: string) =>
    setPicked((prev) =>
      prev.some((p) => p.id === id) ? prev.filter((p) => p.id !== id) : prev.length >= 4 ? prev : [...prev, { id, name }],
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-1 text-[11px] font-black uppercase text-primary">Explore</div>
      <h1 className="text-xl font-bold">Schools</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {result.failed
          ? "Look around for yourself; your shortlist stays yours."
          : `${result.total.toLocaleString("en-US")} validated schools — look around for yourself; your shortlist stays yours.`}
      </p>

      <form
        className="mt-4 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ search: search.trim() || undefined, state: stateCode.trim().toUpperCase() || undefined });
        }}
      >
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="h-9 w-full sm:w-64"
        />
        <Input
          value={stateCode}
          onChange={(e) => setStateCode(e.target.value)}
          placeholder="State (GA)"
          maxLength={2}
          className="h-9 w-24 uppercase"
        />
        <select
          value={filters.setting ?? ""}
          onChange={(e) => apply({ setting: e.target.value || undefined })}
          className={selectClass}
          aria-label="Setting"
        >
          <option value="">Any setting</option>
          {SETTINGS.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
        <select
          value={filters.size ?? ""}
          onChange={(e) => apply({ size: e.target.value || undefined })}
          className={selectClass}
          aria-label="Size"
        >
          <option value="">Any size</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {titleCase(s)}
            </option>
          ))}
        </select>
        <select
          value={filters.sort ?? "name"}
          onChange={(e) => apply({ sort: e.target.value === "name" ? undefined : e.target.value })}
          className={selectClass}
          aria-label="Sort"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" variant="outline">
          Search
        </Button>
      </form>

      {result.failed ? (
        <div className="mt-10 flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load the catalog just now — that&apos;s on us, not your filters.
          </p>
          <Button size="sm" variant="outline" onClick={() => router.refresh()}>
            Try again
          </Button>
        </div>
      ) : result.items.length === 0 ? (
        <div className="mt-10 text-sm text-muted-foreground">
          No schools match those filters. Try widening the search.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((s) => {
            const inBasket = picked.some((p) => p.id === s.id);
            return (
              <div
                key={s.id}
                className="hover-lift relative flex flex-col border border-border bg-card p-4 transition-colors hover:border-primary/30"
              >
                <CornerAccents />
                <Link href={`/schools/${s.id}`} className="min-w-0">
                  <div className="truncate text-sm font-bold">{s.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {[s.city, s.state].filter(Boolean).join(", ") || "Location not listed"}
                    {s.setting ? ` · ${titleCase(s.setting)}` : ""}
                    {s.size ? ` · ${titleCase(s.size)}` : ""}
                  </div>
                </Link>
                <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                  {[
                    { label: "Admit", value: admitPct(s.admitRate) },
                    { label: "Grad", value: pct(s.graduationRate) },
                    { label: "Net/yr", value: money(s.netPrice) },
                    { label: "Earn 10y", value: money(s.medianEarnings) },
                  ].map((f) => (
                    <div key={f.label} className="min-w-0">
                      <div className="truncate text-[13px] font-semibold tabular-nums">{f.value}</div>
                      <div className="text-[10px] uppercase text-muted-foreground">{f.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {s.programCount.toLocaleString("en-US")} programs
                  </span>
                  <Button
                    size="xs"
                    variant={inBasket ? "secondary" : "ghost"}
                    className={cn(!inBasket && "text-muted-foreground")}
                    onClick={() => togglePick(s.id, s.name)}
                    disabled={!inBasket && picked.length >= 4}
                  >
                    {inBasket ? "Picked" : "Compare"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={cn("mt-6 flex items-center justify-between", result.failed && "hidden")}>
        <span className="text-xs text-muted-foreground">
          Page {result.page} of {Math.max(1, result.totalPages)}
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={result.page <= 1} onClick={() => apply({ page: result.page - 1 })}>
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={result.page >= result.totalPages}
            onClick={() => apply({ page: result.page + 1 })}
          >
            Next
          </Button>
        </div>
      </div>

      {picked.length > 0 && (
        <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
          <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5 shadow-lg">
            <span className="truncate text-xs text-muted-foreground">
              Comparing: {picked.map((p) => p.name).join(" · ")}
            </span>
            <div className="flex shrink-0 gap-2">
              <Button size="xs" variant="ghost" onClick={() => setPicked([])}>
                Clear
              </Button>
              {picked.length >= 2 ? (
                <Button size="xs" asChild>
                  <Link href={`/schools/compare?ids=${picked.map((p) => p.id).join(",")}`}>
                    Compare {picked.length}
                  </Link>
                </Button>
              ) : (
                <span className="text-[11px] text-muted-foreground">Pick one more</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
