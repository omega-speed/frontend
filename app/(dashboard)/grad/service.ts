"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { GradOverview, GradPathway, TargetSupervisor } from "./types";

// Grad Studies server actions (UX-009 / SEG-GRAD) — graduate workflows,
// distinct from undergraduate admissions.

export type GradResult = { ok: true; view: GradOverview } | { ok: false; message: string };

export async function getGrad(): Promise<GradResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("grad");
    if (res?.success && res.data) return { ok: true, view: res.data as GradOverview };
    return { ok: false, message: res?.message ?? "Couldn't load your grad plan." };
  } catch {
    return { ok: false, message: "Couldn't load your grad plan." };
  }
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveGradProfile(input: { pathway?: GradPathway; researchInterests?: string[] }): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("grad/profile", input);
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save that." };
  } catch {
    return { ok: false, message: "Couldn't save that." };
  }
}

export async function saveSupervisors(supervisors: TargetSupervisor[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("grad/supervisors", { supervisors });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save your list." };
  } catch {
    return { ok: false, message: "Couldn't save your list." };
  }
}
