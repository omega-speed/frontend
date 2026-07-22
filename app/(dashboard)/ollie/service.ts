"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { OllieAnswer } from "./types";

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
