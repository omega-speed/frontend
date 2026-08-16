"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { EnglishTestPlan, FundingSource, InternationalOverview } from "./types";

// Global overlay server actions (UX-010 / SEG-GLOBAL) — the same product
// through international eyes; process guidance, never legal advice.

export type InternationalResult = { ok: true; view: InternationalOverview } | { ok: false; message: string };

export async function getInternational(): Promise<InternationalResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("international");
    if (res?.success && res.data) return { ok: true, view: res.data as InternationalOverview };
    return { ok: false, message: res?.message ?? "Couldn't load your international plan." };
  } catch {
    return { ok: false, message: "Couldn't load your international plan." };
  }
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveInternational(input: {
  homeCountry?: string;
  englishTest?: EnglishTestPlan;
  fundingSource?: FundingSource;
}): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("international/profile", input);
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save that." };
  } catch {
    return { ok: false, message: "Couldn't save that." };
  }
}
