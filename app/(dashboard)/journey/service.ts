"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getApplications, type ApplicationsResult } from "../ollie/service";
import { getEssays, type EssaysResult } from "../essays/service";

// UX-005 — the Senior journey. Composes the surfaces the season runs on
// (applications, essays, money) and adds the two decision actions:
// recording an admission decision, and the explicit, confirmed enrollment
// commitment (the backend audits both; nothing external is ever sent).

export type DecisionType = "ADMITTED" | "CONDITIONAL_ADMIT" | "DENIED" | "WAITLISTED" | "DEFERRED";

export async function loadSeniorJourney(): Promise<{
  applications: ApplicationsResult;
  essays: EssaysResult;
}> {
  const [applications, essays] = await Promise.all([getApplications(), getEssays()]);
  return { applications, essays };
}

// The learner records the school's decision — self-reported by default; the
// backend keeps self-reported vs verified distinct (QADMIT-DATA-000007).
export async function recordDecision(applicationId: string, decisionType: DecisionType): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post(`q-admit/applications/${applicationId}/decisions`, { decisionType });
    if (!res?.success) return { ok: false, message: res?.message ?? "Couldn't record that decision." };
    await api.post(`q-admit/applications/${applicationId}/status`, { status: "DECIDED" });
    return { ok: true };
  } catch {
    return { ok: false, message: "Couldn't record that decision." };
  }
}

// Marking submitted: the learner confirms they submitted on the school's own
// portal — Qoollege never submits for them (QADMIT-BOUND-000007).
export async function markSubmitted(applicationId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post(`q-admit/applications/${applicationId}/status`, {
      status: "SUBMITTED",
      statusReason: "Learner confirmed they submitted on the school's portal",
    });
    return res?.success ? { ok: true } : { ok: false, message: res?.message };
  } catch {
    return { ok: false, message: "Couldn't update that application." };
  }
}

// The enrollment commitment — the season's one big consequential choice. The UI
// requires an explicit typed confirmation before calling this; the backend
// records it as attributable, append-only status history.
export async function enroll(applicationId: string): Promise<{ ok: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.post(`q-admit/applications/${applicationId}/status`, {
      status: "ENROLLED",
      statusReason: "Learner committed to enroll (explicitly confirmed in the journey)",
    });
    return res?.success ? { ok: true } : { ok: false, message: res?.message };
  } catch {
    return { ok: false, message: "Couldn't record the enrollment." };
  }
}
