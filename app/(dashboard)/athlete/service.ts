"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { AthleteEvent, AthleteOverview, CoachContact } from "./types";

// Athlete-Recruit overlay server actions (UX-011 / SEG-ATH). One profile, one
// plan; the recruiting ladder's rungs stay distinct.

export type AthleteResult = { ok: true; view: AthleteOverview } | { ok: false; message: string };

export async function getAthlete(): Promise<AthleteResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("athlete");
    if (res?.success && res.data) return { ok: true, view: res.data as AthleteOverview };
    return { ok: false, message: res?.message ?? "Couldn't load your athlete plan." };
  } catch {
    return { ok: false, message: "Couldn't load your athlete plan." };
  }
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveOutreach(outreach: CoachContact[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("athlete/outreach", { outreach });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save your list." };
  } catch {
    return { ok: false, message: "Couldn't save your list." };
  }
}

export async function saveEvents(events: AthleteEvent[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("athlete/events", { events });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save your events." };
  } catch {
    return { ok: false, message: "Couldn't save your events." };
  }
}
