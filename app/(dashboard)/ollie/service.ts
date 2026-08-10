"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { AboutView, ConversationMessage, Declaration, FundingView, JourneyView, OllieAnswer, ShortlistView } from "./types";

export type AskResult =
  | { ok: true; answer: OllieAnswer }
  | { ok: false; message: string };

// POST /ollie/ask — the learner asks in their own words; Ollie orchestrates the
// domains and returns one synthesized answer.
export async function askOllie(message: string): Promise<AskResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post("ollie/ask", { message });
    if (res?.success && res.data) return { ok: true, answer: res.data as OllieAnswer };
    return { ok: false, message: res?.message ?? "Ollie couldn't respond just now." };
  } catch {
    return { ok: false, message: "Ollie couldn't respond just now." };
  }
}

// POST /ollie/declare — confirm a SENSITIVE change Ollie proposed.
export async function confirmDeclare(declarations: Declaration[]): Promise<AskResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post("ollie/declare", { declarations });
    if (res?.success && res.data) return { ok: true, answer: res.data as OllieAnswer };
    return { ok: false, message: res?.message ?? "Couldn't save that just now." };
  } catch {
    return { ok: false, message: "Couldn't save that just now." };
  }
}

// GET /ollie/shortlist — the schools currently on the learner's shortlist + why.
export type ShortlistResult =
  | { ok: true; view: ShortlistView }
  | { ok: false; message: string };

export async function getShortlist(): Promise<ShortlistResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("ollie/shortlist");
    if (res?.success && res.data) return { ok: true, view: res.data as ShortlistView };
    return { ok: false, message: res?.message ?? "Couldn't load your shortlist." };
  } catch {
    return { ok: false, message: "Couldn't load your shortlist." };
  }
}

// GET /ollie/funding — the learner's top assessed awards for the Funding tab.
export type FundingResult = { ok: true; view: FundingView } | { ok: false; message: string };

export async function getFunding(): Promise<FundingResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("ollie/funding");
    if (res?.success && res.data) return { ok: true, view: res.data as FundingView };
    return { ok: false, message: res?.message ?? "Couldn't load your funding picks." };
  } catch {
    return { ok: false, message: "Couldn't load your funding picks." };
  }
}

// GET /ollie/journey — the dated timeline: deadlines + do-now tasks.
export type JourneyResult = { ok: true; view: JourneyView } | { ok: false; message: string };

export async function getJourney(): Promise<JourneyResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("ollie/journey");
    if (res?.success && res.data) return { ok: true, view: res.data as JourneyView };
    return { ok: false, message: res?.message ?? "Couldn't load your plan." };
  } catch {
    return { ok: false, message: "Couldn't load your plan." };
  }
}

// GET /ollie/about — what Ollie knows, split into shaping-the-list vs noted.
export type AboutResult = { ok: true; view: AboutView } | { ok: false; message: string };

export async function getAbout(): Promise<AboutResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("ollie/about");
    if (res?.success && res.data) return { ok: true, view: res.data as AboutView };
    return { ok: false, message: res?.message ?? "Couldn't load your profile." };
  } catch {
    return { ok: false, message: "Couldn't load your profile." };
  }
}

// POST /ollie/refresh — re-score the learner's matches after a profile change, so
// the shortlist reflects the new preference. Best-effort; the panel then re-reads.
export async function refreshMatches(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  try {
    await api.post("ollie/refresh", {});
  } catch {
    // non-fatal — the panel will still re-read whatever is stored.
  }
}

// GET /ollie/conversation — the learner's saved transcript, so a reload or return
// keeps the thread. Returns [] on any failure so the chat still opens cleanly.
export async function getConversation(): Promise<ConversationMessage[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  try {
    const res = await api.get("ollie/conversation");
    return res?.success && Array.isArray(res.data) ? (res.data as ConversationMessage[]) : [];
  } catch {
    return [];
  }
}

// POST /ollie/undo — reverse an auto-saved fact; restores the previous value.
export async function undoDeclare(declarations: Declaration[]): Promise<AskResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post("ollie/undo", { declarations });
    if (res?.success && res.data) return { ok: true, answer: res.data as OllieAnswer };
    return { ok: false, message: res?.message ?? "Couldn't undo that just now." };
  } catch {
    return { ok: false, message: "Couldn't undo that just now." };
  }
}

// ---- Q-Admit: application trackers (QA-001…QA-003) ----

export type ApplicationsResult =
  | { ok: true; applications: import("./types").TrackedApplication[] }
  | { ok: false; message: string };

// The learner's tracked applications with readiness and school names — ONE
// backend call (GET /ollie/applications); the backend composes Q-Admit +
// institution names server-side.
export async function getApplications(): Promise<ApplicationsResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("ollie/applications");
    if (res?.success) return { ok: true, applications: (res.data ?? []) as import("./types").TrackedApplication[] };
    return { ok: false, message: res?.message ?? "Couldn't load your applications." };
  } catch {
    return { ok: false, message: "Couldn't load your applications." };
  }
}

// POST /q-admit/applications/{id}/sync — re-interpret the school's canonical
// requirements/deadlines into this tracker (idempotent; learner progress kept).
export async function syncApplication(applicationId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post(`q-admit/applications/${applicationId}/sync`, {});
    return res?.success ? { ok: true } : { ok: false, message: res?.message };
  } catch {
    return { ok: false, message: "Couldn't refresh from the school's data." };
  }
}
