"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PanelListSkeleton } from "./panel-bits";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCalm } from "@/components/molecules/calm-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { confirmDeclare, getAbout, quickAdd, undoDeclare } from "../service";
import type { AboutFact, AboutView } from "../types";

// The About You panel: a navy TWIN CARD with the gold completeness meter, then
// the profile as GROUPED CHIPS. Tapping a chip opens a small anchored EDITOR —
// a real input, Save with a visible loading state, and Remove behind a
// two-step confirm. Failures revert and say so; nothing edits silently.

const GROUPS: { key: string; label: string; match: (f: AboutFact) => boolean }[] = [
  { key: "about", label: "About you", match: (f) => f.category === "academic" || f.category === "background" },
  { key: "interests", label: "Interests & activities", match: (f) => f.category === "interest" },
  {
    key: "fit",
    label: "What fits you",
    match: (f) => ["preference", "financial", "constraint", "goal", "athlete", "circumstance", "wish"].includes(f.category),
  },
];

const keyOf = (f: AboutFact) => `${f.category}/${f.name}`;

function ChipEditor({
  fact,
  saving,
  onSave,
  onRemove,
  onClose,
}: {
  fact: AboutFact;
  saving: boolean;
  onSave: (text: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(fact.value);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const isList = Array.isArray(fact.rawValue);
  const isNumber = typeof fact.rawValue === "number";
  const invalid = isNumber && !Number.isFinite(Number(text));

  return (
    <>
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 z-40 cursor-default" tabIndex={-1} />
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.98 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-9 z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-lg"
      >
        <p className="text-[10px] font-black uppercase text-primary">{fact.label}</p>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && text.trim() && !invalid && !saving) onSave(text.trim());
            if (e.key === "Escape") onClose();
          }}
          disabled={saving}
          className="mt-2 h-9 w-full rounded-full border border-input bg-background px-3.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60"
        />
        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
          {invalid
            ? "This one is a number — digits only."
            : isList
              ? "Separate several with commas — all of them are kept."
              : "Changing this re-sorts your schools. History is kept; nothing is ever lost."}
        </p>

        <Button
          size="sm"
          className="mt-3 w-full rounded-full"
          loading={saving}
          disabled={!text.trim() || invalid || text.trim() === fact.value}
          onClick={() => onSave(text.trim())}
        >
          Save
        </Button>

        <div className="mt-3 border-t border-border/60 pt-2.5">
          {!confirmingRemove ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmingRemove(true)}
              className="w-full rounded-full py-1.5 text-center text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-loss/10 hover:text-loss disabled:opacity-40"
            >
              Remove this detail
            </button>
          ) : (
            <div className="flex items-center justify-between gap-2 rounded-xl bg-loss/5 px-3 py-2">
              <span className="text-[11px] leading-snug text-muted-foreground">It stops shaping your list</span>
              <span className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  disabled={saving}
                  onClick={onRemove}
                  className="rounded-full bg-loss px-3 py-1 text-[11px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Remove
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setConfirmingRemove(false)}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  Keep
                </button>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

function Chip({
  fact,
  scoring,
  editing,
  saving,
  onOpen,
  onSave,
  onRemove,
  onClose,
  index,
}: {
  fact: AboutFact;
  scoring: boolean;
  editing: boolean;
  saving: boolean;
  onOpen: () => void;
  onSave: (text: string) => void;
  onRemove: () => void;
  onClose: () => void;
  index: number;
}) {
  // A spinner means WORK (linear spin, constant speed); calm mode gets a still
  // "…" instead of frozen motion.
  const calm = useCalm();
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
      className="relative inline-flex max-w-full"
    >
      <button
        type="button"
        onClick={onOpen}
        disabled={saving}
        title={scoring ? "Shaping your shortlist — tap to change it" : "Noted, not scored yet — tap to change it"}
        className={`press inline-flex max-w-full items-center gap-1.5 rounded-full py-1.5 px-3 text-xs leading-none transition-[transform,background-color,color,border-color] ${
          editing ? "ring-2 ring-ring/40" : ""
        } ${
          scoring
            ? "bg-accent text-accent-foreground hover:bg-primary/15"
            : "border border-dashed border-border bg-transparent text-muted-foreground hover:border-primary/40"
        } ${saving ? "opacity-70" : ""}`}
      >
        <span className="min-w-0 truncate">
          <span className={scoring ? "text-muted-foreground" : "text-muted-foreground/70"}>{fact.label}</span>{" "}
          <span className={`font-bold ${scoring ? "text-foreground" : "text-muted-foreground"}`}>{fact.value}</span>
        </span>
        {saving && (
          <span className="appear-delayed flex shrink-0 items-center" aria-label="Saving">
            {calm ? (
              <span className="text-[10px] font-bold leading-none text-primary">…</span>
            ) : (
              <Loader2 className="size-3 animate-spin text-primary" strokeWidth={2.5} />
            )}
          </span>
        )}
      </button>
      <AnimatePresence>
        {editing && <ChipEditor fact={fact} saving={saving} onSave={onSave} onRemove={onRemove} onClose={onClose} />}
      </AnimatePresence>
    </motion.span>
  );
}

export function OllieAbout({ refreshKey, onProfileChanged }: { refreshKey: number; onProfileChanged?: () => void }) {
  const [view, setView] = useState<AboutView | null>(null);
  const [loading, startLoad] = useTransition();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    startLoad(async () => {
      const res = await getAbout();
      if (res.ok) setView(res.view);
    });
  }, [refreshKey]);

  const reload = async () => {
    const res = await getAbout();
    if (res.ok) setView(res.view);
  };

  // Save an edit: the chip shows its saving pulse until the twin write returns;
  // failure reverts the panel and says so — never a silent maybe.
  const saveFact = async (f: AboutFact, text: string) => {
    let value: unknown = text;
    if (typeof f.rawValue === "number") {
      const n = Number(text);
      if (!Number.isFinite(n)) return;
      value = n;
    } else if (Array.isArray(f.rawValue)) {
      value = text.split(",").map((x) => x.trim()).filter(Boolean);
    }
    const shown = Array.isArray(value) ? value.join(", ") : String(value);
    setEditingKey(null);
    setSavingKey(keyOf(f));
    const res = await confirmDeclare([
      { category: f.category, name: f.name, value, label: `${f.label} → ${shown}`, ...(f.sensitive ? { sensitivity: "SENSITIVE" as const } : {}) },
    ]);
    setSavingKey(null);
    if (res.ok) {
      toast.success(`${f.label} updated — your list is re-sorting`);
      await reload();
      onProfileChanged?.();
    } else {
      toast.error(res.message || "That didn't save — nothing was changed.");
      await reload();
    }
  };

  const removeFact = async (f: AboutFact) => {
    setEditingKey(null);
    setSavingKey(keyOf(f));
    const res = await undoDeclare([{ category: f.category, name: f.name, value: f.rawValue, label: `${f.label} → ${f.value}` }]);
    setSavingKey(null);
    if (res.ok) {
      toast.success(`${f.label} removed`);
      await reload();
      onProfileChanged?.();
    } else {
      toast.error(res.message || "That didn't go through — the detail is still there.");
      await reload();
    }
  };

  const empty = view && view.using.length === 0 && view.noted.length === 0;
  const meter = view?.completeness;
  const scoringSet = new Set(view?.using ?? []);
  const all = view ? [...view.using, ...view.noted] : [];
  const grouped = GROUPS.map((g) => ({ ...g, facts: all.filter(g.match) })).filter((g) => g.facts.length > 0);
  const other = all.filter((f) => !GROUPS.some((g) => g.match(f)));

  return (
    <div className="flex h-full flex-col">
      {/* The twin card — navy, gold meter: the product's memory made visible. */}
      {meter && !empty && (
        <div className="px-4 pt-3">
          <div
            className="glossy relative overflow-hidden rounded-2xl p-4 text-white"
            style={{ background: "linear-gradient(140deg, var(--navy), oklch(0.31 0.055 280))" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full"
              style={{ background: "radial-gradient(circle, oklch(0.62 0.24 303 / 0.35), transparent 70%)" }}
            />
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold">Ollie knows {meter.knownCount} thing{meter.knownCount === 1 ? "" : "s"} about you</p>
              <p className="text-lg font-black tabular-nums text-gold">{meter.percent}%</p>
            </div>
            <p className="mt-0.5 text-[11px] text-white/60">Built from your chats — tap any detail below to change it</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, var(--gold), oklch(0.8 0.11 90))" }}
                initial={{ width: 0 }}
                animate={{ width: `${meter.percent}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {!view && loading && <PanelListSkeleton rows={3} />}

        {empty && (
          <div className="px-1 py-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nothing here yet — this page fills itself as you talk. Tell Ollie anything: what you enjoy,
              where you&apos;d love to live, what you can spend.
            </p>
          </div>
        )}

        {view && !empty && (
          <div className="space-y-5">
            <QuickAdd
              knownNames={new Set(all.map((f) => f.name))}
              onSaved={(scoringChanged) => {
                void reload();
                if (scoringChanged) onProfileChanged?.();
              }}
            />
            {[...grouped, ...(other.length ? [{ key: "other", label: "Also noted", facts: other }] : [])].map((g) => (
              <section key={g.key}>
                <p className="mb-2 text-[10px] font-black uppercase text-muted-foreground">{g.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {g.facts.map((f, i) => (
                      <Chip
                        key={keyOf(f)}
                        fact={f}
                        scoring={scoringSet.has(f)}
                        editing={editingKey === keyOf(f)}
                        saving={savingKey === keyOf(f)}
                        onOpen={() => setEditingKey(editingKey === keyOf(f) ? null : keyOf(f))}
                        onSave={(text) => void saveFact(f, text)}
                        onRemove={() => void removeFact(f)}
                        onClose={() => setEditingKey(null)}
                        index={i}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            ))}

            {/* The missing-item prompt — the meter's next hint made actionable */}
            {meter && meter.percent < 100 && (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3">
                <p className="text-[10px] font-black uppercase text-primary">One thing would sharpen this</p>
                <p className="mt-1 text-xs leading-relaxed text-foreground">{meter.nextHint}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Just say it in the chat — it lands here on its own.</p>
              </div>
            )}

            <p className="flex items-center gap-3 border-t border-border/60 pt-3 text-[10px] leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full bg-accent" aria-hidden />shaping your list</span>
              <span className="inline-flex items-center gap-1"><span className="inline-block size-2 rounded-full border border-dashed border-border" aria-hidden />noted, not scored yet</span>
              <span className="ml-auto">tap a chip to change it</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


// Quick add: the second door. One fact in your own words — the SAME interpreter
// that reads chat reads this, so there is no form schema and nothing to block.
const QUICK_CHIPS: { label: string; template: string; names: string[] }[] = [
  { label: "grade", template: "I'm in grade ", names: ["grade_level", "current_grade"] },
  { label: "GPA", template: "My GPA is ", names: ["gpa"] },
  { label: "home state", template: "I live in ", names: ["residency_state"] },
  { label: "budget", template: "My yearly budget is ", names: ["annual_budget"] },
  { label: "field", template: "I want to study ", names: ["discipline", "disciplines"] },
];

function QuickAdd({
  knownNames,
  onSaved,
}: {
  knownNames: Set<string>;
  onSaved: (scoringChanged: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const chips = QUICK_CHIPS.filter((c) => !c.names.some((n) => knownNames.has(n)));

  const add = () => {
    const t = text.trim();
    if (!t || saving) return;
    setNote(null);
    startSave(async () => {
      const res = await quickAdd(t);
      if (res.ok && res.understood && (res.saved?.length ?? 0) > 0) {
        setText("");
        setNote(`Saved: ${res.saved!.map((d) => d.label).join(", ")}`);
        onSaved(Boolean(res.scoringChanged));
      } else if (res.ok && res.skippedSensitive) {
        setNote("That one's personal — tell Ollie in the chat so you can confirm it explicitly.");
      } else if (res.ok) {
        setNote("Didn't catch that as a fact about you — try the chat, Ollie will ask back.");
      } else {
        setNote(res.message ?? "Couldn't save that just now.");
      }
    });
  };

  return (
    <div className="mx-5 mt-3 rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[10px] font-black uppercase text-muted-foreground">Quick add</p>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="One thing, like: GPA 3.8"
          className="h-8 flex-1 rounded-full border border-input bg-background px-3 text-xs outline-none transition-[border-color,background-color] duration-200 placeholder:text-muted-foreground/40 focus-visible:border-primary/60 focus-visible:bg-card"
        />
        <button
          type="button"
          disabled={saving || !text.trim()}
          onClick={add}
          className="press flex items-center gap-1.5 text-[11px] font-bold text-primary transition-opacity hover:opacity-75 disabled:opacity-40"
        >
          Add
          {saving && <span className="appear-delayed"><Loader2 className="size-3 animate-spin" strokeWidth={2.5} /></span>}
        </button>
      </div>
      {chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                setText(c.template);
                inputRef.current?.focus();
              }}
              className="press rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground transition-[transform,background-color] hover:bg-primary/15"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence initial={false}>
        {note && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22 }}
            className="mt-2 overflow-hidden text-[11px] leading-relaxed text-muted-foreground"
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
