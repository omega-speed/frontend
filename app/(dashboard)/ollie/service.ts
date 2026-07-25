"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { AboutView, Declaration, OllieAnswer, ShortlistView } from "./types";

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
