// Mirrors the backend homeschool experience contract (GET/PUT /homeschool, UX-006 / SEG-HOME).

export interface HomeschoolCourse {
  name: string;
  subject: string;
  gradeLevel: number; // 9–12
  grade: string; // letter grade
  credits: number;
  // Curriculum provenance — recorded as the family states it, never judged.
  curriculum: { source: "provider" | "co-op" | "self-designed"; provider?: string };
  // Evidence-based rigor anchors the family can point to.
  rigor: ("AP" | "CLEP" | "dual-enrollment" | "honors" | "portfolio" | "external-exam")[];
  dualEnrollment?: { institution: string };
}

export interface HomeschoolProfile {
  schoolName?: string;
  gradingScale?: string;
  philosophy?: string;
  // The parent who TEACHES — a distinct role from the guardian.
  parentEducator?: { name: string; relationship: string };
  guardian?: { name: string; relationship: string };
}

export interface HomeschoolEvaluator {
  name: string;
  role: "evaluator" | "recommender";
  status: "planned" | "asked" | "received";
}

export interface HomeschoolOverview {
  isHomeschool: boolean;
  profile: HomeschoolProfile;
  courses: HomeschoolCourse[];
  credits: number;
  computedGpa: number | null; // from THEIR grades — a declared GPA always wins
  declaredGpa: number | null;
  dualEnrollmentCount: number;
  evaluators: HomeschoolEvaluator[];
  stateNote: { version: number; text: string };
  tasks: { title: string; detail: string }[];
}
