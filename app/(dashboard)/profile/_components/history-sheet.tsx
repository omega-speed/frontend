"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getAttributeHistory, type TwinAttribute } from "../service";
import { ConfidenceBadge } from "./confidence";
import type { CatalogField } from "../catalog";

function formatValue(value: unknown, field: CatalogField): string {
  const raw = String(value ?? "");
  const option = field.options?.find((o) => o.value === raw);
  return option?.label ?? raw;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export function HistorySheet({
  field,
  open,
  onOpenChange,
}: {
  field: CatalogField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [items, setItems] = useState<TwinAttribute[] | null>(null);

  // Mounted fresh per open by the parent; fetch once for this attribute. setItems
  // is only called from the async callback, never synchronously in the effect.
  useEffect(() => {
    let active = true;
    getAttributeHistory(field.category, field.name).then((res) => {
      if (active) setItems(res?.success ? (res.data ?? []) : []);
    });
    return () => {
      active = false;
    };
  }, [field.category, field.name]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-black">{field.label} — history</SheetTitle>
          <SheetDescription>
            Every version, newest first. Older values are kept, never erased.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-3 p-4">
          {items === null && (
            <p className="text-[13px] font-black text-muted-foreground">Loading…</p>
          )}
          {items?.length === 0 && (
            <p className="text-[13px] font-black text-muted-foreground">
              Nothing recorded yet.
            </p>
          )}
          {items?.map((v) => (
            <div
              key={v.id}
              className="relative border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-black text-foreground">
                  {formatValue(v.value, field)}
                </span>
                <ConfidenceBadge state={v.confidenceState} />
              </div>
              <p className="mt-1 text-[11px] font-black text-muted-foreground">
                {formatDate(v.validFrom)}
                {v.validTo ? ` → ${formatDate(v.validTo)}` : " → current"}
                {v.sourceId ? ` · source: ${v.sourceId}` : ""}
              </p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
