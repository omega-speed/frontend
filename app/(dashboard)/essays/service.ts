"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { EssayDetail, EssayListItem } from "./types";

// Q-Essay server actions (QE-001…QE-003). Content always flows FROM the
// learner; the backend returns advice with reasons, never rewritten drafts.

export type EssaysResult = { ok: true; essays: EssayListItem[] } | { ok: false; message: string };

export async function getEssays(): Promise<EssaysResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get(`q-essay/learners/${user.id}/essays?limit=25`);
    if (res?.success) return { ok: true, essays: (res.data ?? []) as EssayListItem[] };
    return { ok: false, message: res?.message ?? "Couldn't load your essays." };
  } catch {
    return { ok: false, message: "Couldn't load your essays." };
  }
}

export type EssayResult = { ok: true; essay: EssayDetail } | { ok: false; message: string };

export async function getEssay(id: string): Promise<EssayResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get(`q-essay/essays/${id}`);
    if (res?.success && res.data) return { ok: true, essay: res.data as EssayDetail };
    return { ok: false, message: res?.message ?? "Couldn't open that essay." };
  } catch {
    return { ok: false, message: "Couldn't open that essay." };
  }
}

// Create prompt (verbatim, QESSAY-PROMPT-000001) + essay in one step.
export async function createEssay(input: {
  promptText: string;
  wordLimit?: number;
  context?: string;
}): Promise<EssayResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const prompt = await api.post("q-essay/prompts", {
      learnerId: user.id,
      promptText: input.promptText,
      wordLimit: input.wordLimit,
      source: "manual",
    });
    if (!prompt?.success || !prompt.data) return { ok: false, message: prompt?.message ?? "Couldn't save the prompt." };
    const essay = await api.post("q-essay/essays", {
      learnerId: user.id,
      promptId: prompt.data.id,
      context: input.context,
    });
    if (!essay?.success || !essay.data) return { ok: false, message: essay?.message ?? "Couldn't create the essay." };
    return getEssay(essay.data.id);
  } catch {
    return { ok: false, message: "Couldn't create the essay." };
  }
}

// A new draft version — append-only; every version says what help touched it
// (QESSAY-AUTH-000004). Then the deterministic review runs so feedback is fresh.
export async function saveDraft(
  essayId: string,
  content: string,
  aiAssisted: boolean,
  assistanceDescription?: string,
): Promise<EssayResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const version = await api.post(`q-essay/essays/${essayId}/versions`, {
      content,
      assistanceMetadata: aiAssisted ? { aiAssisted, assistanceDescription } : { aiAssisted: false },
    });
    if (!version?.success) return { ok: false, message: version?.message ?? "Couldn't save the draft." };
    await api.post(`q-essay/essays/${essayId}/review`, {});
    return getEssay(essayId);
  } catch {
    return { ok: false, message: "Couldn't save the draft." };
  }
}

export async function setEssayStatus(essayId: string, status: "READY" | "DRAFTING"): Promise<EssayResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post(`q-essay/essays/${essayId}/status`, { status });
    if (!res?.success) return { ok: false, message: res?.message ?? "Couldn't update the status." };
    return getEssay(essayId);
  } catch {
    return { ok: false, message: "Couldn't update the status." };
  }
}
