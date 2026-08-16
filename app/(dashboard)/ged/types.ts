// Mirrors the backend GED experience contract (GET/PUT /ged, UX-007 / SEG-GED).

export type GedSubjectName =
  | "Reasoning Through Language Arts"
  | "Mathematical Reasoning"
  | "Science"
  | "Social Studies";

export interface GedSubject {
  subject: GedSubjectName;
  status: "not-started" | "scheduled" | "passed";
}

export type GedResponsibility = "working" | "parenting" | "caregiving" | "military" | "other";

export interface GedOverview {
  isGed: boolean;
  subjects: GedSubject[];
  passedCount: number;
  complete: boolean;
  responsibilities: GedResponsibility[];
  pathways: { key: string; title: string; detail: string; link: string }[];
  placementNote: { version: number; text: string };
  fundingNote: string;
  tasks: { title: string; detail: string }[];
}
