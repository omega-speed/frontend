"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// POST /q-match/learners/:id/matches/refresh — rebuild the signed-in learner's
// matches against the active catalog using their latest twin. Called after a
// matching-input edit so the change actually moves the results.
export async function refreshMatches() {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Not signed in" };
  try {
    return await api.post(`q-match/learners/${user.id}/matches/refresh`, {});
  } catch (error) {
    return error;
  }
}

// Mirrors the backend Student Digital Twin contract (SDT-002).
export interface TwinAttribute {
  id: string;
  category: string;
  name: string;
  value: unknown;
  lane: "FACT" | "INFERENCE";
  confidenceState:
    | "VERIFIED"
    | "CORROBORATED"
    | "USER_DECLARED"
    | "IMPORTED"
    | "INFERRED"
    | "PREDICTED"
    | "DISPUTED"
    | "STALE"
    | "UNKNOWN";
  sensitivityClass: string;
  purposeRestrictions: string[];
  sourceId: string | null;
  disputeState: string;
  validFrom: string;
  validTo: string | null;
}

export interface StudentTwin {
  learnerId: string;
  consentStatus: "ACTIVE" | "LIMITED" | "WITHDRAWN";
  consentPurposes: string[];
  attributes: TwinAttribute[];
}

// GET /twin/me — the learner's full current twin.
export async function getTwin() {
  try {
    return await api.get("twin/me");
  } catch (error) {
    return error;
  }
}

// POST /twin/me/observations — self-declare an attribute (stored USER_DECLARED).
export async function declareAttribute(input: {
  category: string;
  name: string;
  value: unknown;
  sensitivityClass?: string;
  purposeRestrictions?: string[];
}) {
  try {
    return await api.post("twin/me/observations", input);
  } catch (error) {
    return error;
  }
}

// GET /twin/me/history — every version of one attribute (newest first).
export async function getAttributeHistory(category: string, name: string) {
  try {
    return await api.get(
      `twin/me/history?category=${encodeURIComponent(category)}&name=${encodeURIComponent(name)}`,
    );
  } catch (error) {
    return error;
  }
}

// PUT /twin/me/consent — update the learner's twin consent posture.
export async function updateConsent(input: {
  status: "ACTIVE" | "LIMITED" | "WITHDRAWN";
  purposes?: string[];
}) {
  try {
    return await api.put("twin/me/consent", input);
  } catch (error) {
    return error;
  }
}
