"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { GedOverview, GedResponsibility, GedSubject } from "./types";

// GED-to-college server actions (UX-007 / SEG-GED). Status and pathways only —
// never test content; everything is a twin fact.

export type GedResult = { ok: true; view: GedOverview } | { ok: false; message: string };

export async function getGed(): Promise<GedResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("ged");
    if (res?.success && res.data) return { ok: true, view: res.data as GedOverview };
    return { ok: false, message: res?.message ?? "Couldn't load your GED plan." };
  } catch {
    return { ok: false, message: "Couldn't load your GED plan." };
  }
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveGedProgress(subjects: GedSubject[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("ged/progress", { subjects });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save your progress." };
  } catch {
    return { ok: false, message: "Couldn't save your progress." };
  }
}

export async function saveResponsibilities(responsibilities: GedResponsibility[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("ged/responsibilities", { responsibilities });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save that." };
  } catch {
    return { ok: false, message: "Couldn't save that." };
  }
}
