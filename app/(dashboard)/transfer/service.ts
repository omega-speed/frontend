"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type { TransferCourse, TransferOverview } from "./types";

// Transfer server actions (UX-008 / SEG-TRANSFER). Estimates with confidence —
// the receiving school's evaluation is always the real answer.

export type TransferResult = { ok: true; view: TransferOverview } | { ok: false; message: string };

export async function getTransfer(): Promise<TransferResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("transfer");
    if (res?.success && res.data) return { ok: true, view: res.data as TransferOverview };
    return { ok: false, message: res?.message ?? "Couldn't load your transfer plan." };
  } catch {
    return { ok: false, message: "Couldn't load your transfer plan." };
  }
}

export type SaveResult = { ok: true } | { ok: false; message: string };

export async function saveTransferCourses(courses: TransferCourse[]): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.put("transfer/courses", { courses });
    if (res?.success) return { ok: true };
    return { ok: false, message: res?.message ?? "Couldn't save your courses." };
  } catch {
    return { ok: false, message: "Couldn't save your courses." };
  }
}
