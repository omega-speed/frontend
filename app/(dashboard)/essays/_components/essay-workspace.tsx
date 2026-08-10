"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { CornerAccents } from "@/components/ui/corner-accents";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledTextarea from "@/components/molecules/controlled-textarea";
import { createEssay, getEssay, saveDraft, setEssayStatus } from "../service";
import type { EssayDetail, EssayListItem } from "../types";
import { useNewEssay } from "../_hooks/use-new-essay";

const STATUS: Record<string, { label: string; color: string }> = {
  DRAFTING: { label: "Drafting", color: "var(--muted-foreground)" },
  IN_REVIEW: { label: "In review", color: "var(--social)" },
  READY: { label: "Ready", color: "var(--win)" },
  SUBMITTED: { label: "Submitted", color: "var(--primary)" },
  ARCHIVED: { label: "Archived", color: "var(--muted-foreground)" },
};

const countWords = (t: string) => (t.trim().match(/\S+/g) ?? []).length;

function NewEssayForm({ onDone, busy }: { onDone: (input: { promptText: string; wordLimit?: number; context?: string }) => void; busy: boolean }) {
  const { form, onSubmit } = useNewEssay(onDone);
  return (
    <div className="relative border border-border bg-card p-5">
      <CornerAccents />
      <p className="text-[11px] font-black uppercase text-primary">New essay</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Paste the prompt exactly as the school words it — it&apos;s kept verbatim, never paraphrased.
      </p>
      <Form {...form}>
        <form onSubmit={onSubmit} className="mt-3 space-y-3">
          <ControlledTextarea name="promptText" label="The prompt" placeholder="e.g. Describe a challenge you overcame and what you learned." />
          <div className="grid grid-cols-2 gap-3">
            <ControlledInput name="wordLimit" label="Word limit" type="number" placeholder="e.g. 650" optional />
            <ControlledInput name="context" label="Label" placeholder="e.g. Common App personal statement" optional />
          </div>
          <Button type="submit" disabled={busy} className="cta-btn">
            {busy ? "Creating…" : "Start this essay"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

function Editor({ essay, onRefresh }: { essay: EssayDetail; onRefresh: (e: EssayDetail) => void }) {
  const current = essay.versions[0] ?? null;
  const [draft, setDraft] = useState(current?.content ?? "");
  const [aiAssisted, setAiAssisted] = useState(false);
  const [aiNote, setAiNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const words = countWords(draft);
  const limit = essay.prompt.wordLimit;
  const over = limit != null && words > limit;
  const feedback = current?.feedback ?? [];
  const criticalOpen = feedback.filter((f) => f.severity === "CRITICAL").length;
  const s = STATUS[essay.status] ?? STATUS.DRAFTING;

  const save = () => {
    setMessage(null);
    startTransition(async () => {
      const res = await saveDraft(essay.id, draft, aiAssisted, aiNote.trim() || undefined);
      if (res.ok) {
        onRefresh(res.essay);
        setMessage("Draft saved and reviewed — every draft is kept, nothing is overwritten.");
      } else setMessage(res.message);
    });
  };

  const markReady = (ready: boolean) => {
    startTransition(async () => {
      const res = await setEssayStatus(essay.id, ready ? "READY" : "DRAFTING");
      if (res.ok) onRefresh(res.essay);
    });
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="relative border border-border bg-card p-5">
        <CornerAccents />
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-black uppercase text-primary">{essay.context ?? "Essay"}</p>
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold" style={{ color: s.color }}>
            <span className="size-1.5 rounded-full" style={{ background: s.color }} aria-hidden />
            {s.label}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{essay.prompt.promptText}</p>
        {limit != null && <p className="mt-1 text-xs text-muted-foreground">Word limit: {limit}</p>}
      </div>

      <div className="relative border border-border bg-card p-5">
        <CornerAccents />
        <div className="flex items-baseline justify-between">
          <p className="text-[11px] font-black uppercase text-muted-foreground">
            Your draft{current ? ` · v${current.version}` : ""}
          </p>
          <p className={`text-xs tabular-nums ${over ? "text-loss" : "text-muted-foreground"}`}>
            {words}
            {limit != null ? `/${limit}` : ""} words
          </p>
        </div>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          placeholder="Write here — your words, kept exactly as you write them."
          className="mt-2 w-full resize-y border border-border bg-background p-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary/40"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={aiAssisted} onChange={(e) => setAiAssisted(e.target.checked)} className="size-3.5" />
            AI or outside help touched this draft
          </label>
          {aiAssisted && (
            <input
              value={aiNote}
              onChange={(e) => setAiNote(e.target.value)}
              placeholder="What kind of help? (kept with the version)"
              className="min-w-0 flex-1 border border-border bg-background px-2 py-1 text-xs outline-none placeholder:text-muted-foreground/40"
            />
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={save} disabled={busy || countWords(draft) === 0} className="cta-btn">
            {busy ? "Saving…" : "Save draft & review"}
          </Button>
          {essay.status !== "READY" ? (
            <button
              type="button"
              onClick={() => markReady(true)}
              disabled={busy || !current || criticalOpen > 0}
              className="text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              title={criticalOpen > 0 ? "Clear the critical fixes first" : undefined}
            >
              Mark ready
            </button>
          ) : (
            <button
              type="button"
              onClick={() => markReady(false)}
              disabled={busy}
              className="text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to drafting
            </button>
          )}
        </div>
        {message && <p className="mt-2 text-xs text-muted-foreground">{message}</p>}
      </div>

      {feedback.length > 0 && (
        <div className="relative border border-border bg-card p-5">
          <CornerAccents />
          <p className="text-[11px] font-black uppercase text-muted-foreground">
            Feedback on v{current?.version} — advice, not edits. What you accept is your call.
          </p>
          <div className="mt-2 flex flex-col gap-2.5">
            {feedback.map((f) => (
              <div key={f.id}>
                <p className="text-sm leading-snug text-foreground">
                  <span
                    className="mr-2 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      color: f.severity === "CRITICAL" ? "var(--loss)" : "var(--muted-foreground)",
                      background: f.severity === "CRITICAL" ? "color-mix(in oklab, var(--loss) 10%, transparent)" : "var(--muted)",
                    }}
                  >
                    {f.severity === "CRITICAL" ? "Fix" : "Consider"}
                  </span>
                  {f.suggestion}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        You are the author — Qoollege never writes your essay, and every version records what help touched it.
      </p>
    </div>
  );
}

export function EssayWorkspace({ initial }: { initial: EssayListItem[] }) {
  const [essays, setEssays] = useState<EssayListItem[]>(initial);
  const [selected, setSelected] = useState<EssayDetail | null>(null);
  const [creating, setCreating] = useState(initial.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [busy, startTransition] = useTransition();

  const open = (id: string) => {
    setError(null);
    startTransition(async () => {
      const res = await getEssay(id);
      if (res.ok) {
        setSelected(res.essay);
        setCreating(false);
      } else setError(res.message);
    });
  };

  const onCreate = (input: { promptText: string; wordLimit?: number; context?: string }) => {
    setError(null);
    startTransition(async () => {
      const res = await createEssay(input);
      if (res.ok) {
        setSelected(res.essay);
        setCreating(false);
        setEssays((prev) => [
          {
            id: res.essay.id,
            status: res.essay.status,
            context: res.essay.context,
            applicationId: null,
            prompt: res.essay.prompt,
            versions: [],
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else setError(res.message);
    });
  };

  const onRefresh = (e: EssayDetail) => {
    setSelected(e);
    setEssays((prev) => prev.map((row) => (row.id === e.id ? { ...row, status: e.status, versions: e.versions } : row)));
  };

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
      <motion.aside
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full shrink-0 lg:w-72"
      >
        <div className="relative border border-border bg-card">
          <CornerAccents />
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[11px] font-black uppercase text-primary">Your essays</p>
            <button
              type="button"
              onClick={() => {
                setCreating(true);
                setSelected(null);
              }}
              className="text-[11px] font-semibold uppercase text-muted-foreground transition-colors hover:text-foreground"
            >
              + New
            </button>
          </div>
          {essays.length === 0 ? (
            <p className="px-4 py-4 text-xs leading-relaxed text-muted-foreground">Nothing yet — start with a prompt.</p>
          ) : (
            <ul>
              {essays.map((e) => {
                const st = STATUS[e.status] ?? STATUS.DRAFTING;
                const latest = e.versions[0];
                return (
                  <li key={e.id} className="border-b border-border/70 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => open(e.id)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted/40 ${selected?.id === e.id ? "bg-muted/40" : ""}`}
                    >
                      <p className="truncate text-[13px] font-semibold text-foreground">
                        {e.context ?? e.prompt.promptText.slice(0, 48)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        <span style={{ color: st.color }}>{st.label}</span>
                        {latest ? ` · v${latest.version} · ${latest.wordCount} words` : " · no draft yet"}
                        {` · ${dayjs(e.createdAt).format("MMM D")}`}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.aside>

      <div className="min-w-0 flex-1">
        {error && <p className="mb-3 text-sm text-loss">{error}</p>}
        {creating ? (
          <NewEssayForm onDone={onCreate} busy={busy} />
        ) : selected ? (
          <Editor essay={selected} onRefresh={onRefresh} />
        ) : (
          <p className="text-sm text-muted-foreground">Pick an essay on the left, or start a new one.</p>
        )}
      </div>
    </div>
  );
}
