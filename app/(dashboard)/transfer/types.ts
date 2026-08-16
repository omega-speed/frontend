// Mirrors the backend transfer experience contract (GET/PUT /transfer, UX-008 / SEG-TRANSFER).

export type TransferCourseType = "gen-ed" | "major" | "elective";

export interface TransferCourse {
  courseName: string;
  subject: string;
  credits: number;
  type: TransferCourseType;
  grade: string;
  source: string;
}

export interface TransferOverview {
  isTransfer: boolean;
  courses: TransferCourse[];
  totals: { credits: number; byType: Record<TransferCourseType, number> };
  estimate: {
    retainedLow: number;
    retainedHigh: number;
    confidence: "LOW";
    why: string;
    belowGradeCredits: number;
  };
  timeToDegree: { remainingLow: number; remainingHigh: number; yearsLow: number; yearsHigh: number; basis: string };
  articulation: { agreements: { from: string; to: string; effectiveFrom: string; effectiveTo: string | null }[]; note: string };
  residencyNote: { version: number; text: string };
  affordabilityNote: string;
  pathways: { key: string; title: string; detail: string }[];
  tasks: { title: string; detail: string }[];
}
