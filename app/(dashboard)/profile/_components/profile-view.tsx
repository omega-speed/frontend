"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CornerAccents } from "@/components/ui/corner-accents";
import {
  getTwin,
  updateConsent,
  type StudentTwin,
  type TwinAttribute,
} from "../service";
import { CATALOG, CATALOG_KEYS, type CatalogField } from "../catalog";
import { ConfidenceBadge, SensitivityMarker } from "./confidence";
import { EditAttributeDialog } from "./edit-attribute-dialog";
import { HistorySheet } from "./history-sheet";

const CONSENT_LABELS: Record<StudentTwin["consentStatus"], string> = {
  ACTIVE: "Active — Qoollege can use it to guide you",
  LIMITED: "Limited — only where you've allowed",
  WITHDRAWN: "Withdrawn — no one can use it",
};

function displayValue(attr: TwinAttribute, field?: CatalogField): string {
  const raw = String(attr.value ?? "");
  return field?.options?.find((o) => o.value === raw)?.label ?? raw;
}

export function ProfileView({ initialTwin }: { initialTwin: StudentTwin }) {
  const [twin, setTwin] = useState<StudentTwin>(initialTwin);
  const [editing, setEditing] = useState<CatalogField | null>(null);
  const [historyField, setHistoryField] = useState<CatalogField | null>(null);

  async function refresh() {
    const res = await getTwin();
    if (res?.success && res.data) setTwin(res.data as StudentTwin);
  }

  // Current value for a catalog field: prefer a fact, fall back to an estimate.
  const currentByKey = useMemo(() => {
    const map = new Map<string, TwinAttribute>();
    for (const a of twin.attributes) {
      if (a.validTo) continue;
      const key = `${a.category}:${a.name}`;
      const existing = map.get(key);
      if (!existing || (existing.lane === "INFERENCE" && a.lane === "FACT")) {
        map.set(key, a);
      }
    }
    return map;
  }, [twin]);

  const otherAttributes = useMemo(
    () =>
      twin.attributes.filter(
        (a) => !a.validTo && !CATALOG_KEYS.has(`${a.category}:${a.name}`),
      ),
    [twin],
  );

  async function onConsentChange(status: StudentTwin["consentStatus"]) {
    const res = await updateConsent({ status });
    if (!res?.success) {
      toast.error(res?.message ?? "Could not update consent.");
      return;
    }
    setTwin((t) => ({ ...t, consentStatus: status }));
    toast.success("Consent updated.");
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-[11px] font-black uppercase text-primary">Your profile</p>
      <h1 className="mt-2 text-[26px] font-black leading-[1.1] tracking-[-0.02em] text-foreground">
        What Qoollege knows about you.
      </h1>
      <p className="mt-1.5 text-[13px] font-black text-muted-foreground">
        Everything here is yours to see and change. Each detail shows where it
        came from — and we never overwrite your history.
      </p>

      {/* Consent */}
      <div className="relative mt-6 border border-border bg-card p-4">
        <CornerAccents />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-black text-foreground">
              Who can use your profile
            </p>
            <p className="text-[12px] font-black text-muted-foreground">
              You&apos;re always in control. Change this whenever you like.
            </p>
          </div>
          <Select value={twin.consentStatus} onValueChange={onConsentChange}>
            <SelectTrigger className="h-10 w-full sm:w-[320px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(["ACTIVE", "LIMITED", "WITHDRAWN"] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {CONSENT_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Catalog sections */}
      <div className="mt-6 flex flex-col gap-6">
        {CATALOG.map((section) => (
          <section
            key={section.key}
            className="relative border border-border bg-card"
          >
            <CornerAccents />
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-[14px] font-black text-foreground">
                {section.title}
              </h2>
              <p className="text-[12px] font-black text-muted-foreground">
                {section.blurb}
              </p>
            </div>
            <div className="divide-y divide-border">
              {section.fields.map((field) => {
                const attr = currentByKey.get(`${field.category}:${field.name}`);
                return (
                  <div
                    key={field.name}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase text-muted-foreground">
                        {field.label}
                      </p>
                      {attr ? (
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-black text-foreground">
                            {displayValue(attr, field)}
                          </span>
                          <ConfidenceBadge state={attr.confidenceState} />
                          <SensitivityMarker sensitivity={attr.sensitivityClass} />
                        </div>
                      ) : (
                        <p className="mt-0.5 text-[13px] font-black text-faint">
                          Not added yet
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {attr && (
                        <Button
                          variant="ghost"
                          className="h-8 px-2 text-[12px] font-black text-muted-foreground"
                          onClick={() => setHistoryField(field)}
                        >
                          History
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="h-8 px-2 text-[12px] font-black text-primary"
                        onClick={() => setEditing(field)}
                      >
                        {attr ? "Edit" : "Add"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Anything the twin holds that isn't in the curated catalog (e.g. values
            imported from documents or written by a domain later). */}
        {otherAttributes.length > 0 && (
          <section className="relative border border-border bg-card">
            <CornerAccents />
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-[14px] font-black text-foreground">
                Also on file
              </h2>
              <p className="text-[12px] font-black text-muted-foreground">
                Added from your documents or by Qoollege, with the source shown.
              </p>
            </div>
            <div className="divide-y divide-border">
              {otherAttributes.map((attr) => (
                <div
                  key={attr.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase text-muted-foreground">
                      {attr.category} · {attr.name}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-black text-foreground">
                        {String(attr.value ?? "")}
                      </span>
                      <ConfidenceBadge state={attr.confidenceState} />
                      <SensitivityMarker sensitivity={attr.sensitivityClass} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {editing && (
        <EditAttributeDialog
          field={editing}
          currentValue={String(
            currentByKey.get(`${editing.category}:${editing.name}`)?.value ?? "",
          )}
          open={!!editing}
          onOpenChange={(open) => !open && setEditing(null)}
          onSaved={refresh}
        />
      )}

      {historyField && (
        <HistorySheet
          field={historyField}
          open={!!historyField}
          onOpenChange={(open) => !open && setHistoryField(null)}
        />
      )}
    </div>
  );
}
