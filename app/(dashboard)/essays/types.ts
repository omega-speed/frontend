// Mirrors the backend Q-Essay contracts (QE-001…QE-003). The learner remains
// the author (QESSAY-AUTH-000001) — this workspace stores THEIR words and shows
// advice; it never writes essay content.

export type EssayStatus = "DRAFTING" | "IN_REVIEW" | "READY" | "SUBMITTED" | "ARCHIVED";

export interface EssayPromptLite {
  promptText: string;
  wordLimit: number | null;
  applicationId: string | null;
}

export interface EssayVersionLite {
  id: string;
  wordCount: number;
  version: number;
  createdAt: string;
}

export interface EssayListItem {
  id: string;
  status: EssayStatus;
  context: string | null;
  applicationId: string | null;
  prompt: EssayPromptLite;
  versions: EssayVersionLite[]; // latest only, from the list endpoint
  createdAt: string;
}

export interface EssayFeedbackRow {
  id: string;
  dimension: string;
  severity: "CRITICAL" | "OPTIONAL";
  suggestion: string;
  reason: string; // every suggestion carries its why (QESSAY-REV-000001)
  createdAt: string;
}

export interface EssayVersionFull {
  id: string;
  content: string;
  wordCount: number;
  version: number;
  assistanceMetadata: Record<string, unknown>;
  createdAt: string;
  feedback: EssayFeedbackRow[];
}

export interface EssayDetail {
  id: string;
  learnerId: string;
  status: EssayStatus;
  context: string | null;
  prompt: EssayPromptLite & { id: string };
  versions: EssayVersionFull[]; // current version only, with feedback
}
