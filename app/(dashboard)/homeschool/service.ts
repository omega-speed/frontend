"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { HomeschoolCourse, HomeschoolEvaluator, HomeschoolOverview, HomeschoolProfile } from "./types";

// Homeschool experience server actions (UX-006 / SEG-HOME). Everything is a
// learner-declared fact on the Student Digital Twin — the backend owns no
// separate homeschool storage.

export type HomeschoolResult = { ok: true; view: HomeschoolOverview } | { ok: false; message: string };

export async function getHomeschool(): Promise<HomeschoolResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("homeschool");
    if (res?.success && res.data) return { ok: true, view: res.data as HomeschoolOverview };
    return { ok: false, message: res?.message ?? "Couldn't load your homeschool records." };
  } catch {
    return { ok: false, message: "Couldn't load your homeschool records." };
  }
}

export type SaveResult = { ok: true; computedGpa?: number | null } | { ok: false; message: string };

export async function saveTranscript(courses: HomeschoolCourse[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("homeschool/transcript", { courses });
    if (res?.success) return { ok: true, computedGpa: (res.data as { computedGpa?: number | null })?.computedGpa ?? null };
    return { ok: false, message: res?.message ?? "Couldn't save the transcript." };
  } catch {
    return { ok: false, message: "Couldn't save the transcript." };
  }
}

export async function saveProfile(profile: HomeschoolProfile): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("homeschool/profile", profile);
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save the profile." };
  } catch {
    return { ok: false, message: "Couldn't save the profile." };
  }
}

export async function saveEvaluators(evaluators: HomeschoolEvaluator[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("homeschool/evaluators", { evaluators });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save the contacts." };
  } catch {
    return { ok: false, message: "Couldn't save the contacts." };
  }
}
