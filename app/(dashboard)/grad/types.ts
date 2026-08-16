// Mirrors the backend grad experience contract (GET/PUT /grad, UX-009 / SEG-GRAD).

export type GradPathway = "coursework" | "research";

export interface TargetSupervisor {
  name: string;
  institution: string;
  topic?: string;
  status: "identified" | "contacted" | "responded" | "declined";
}

export interface SupervisorRow extends TargetSupervisor {
  availability: string;
  confidence: string; // NONE | LOW | HIGH — only their own reply raises it
}

export interface GradOverview {
  isGrad: boolean;
  level: string | null;
  pathway: GradPathway | null;
  researchInterests: string[];
  supervisors: SupervisorRow[];
  connections: { key: string; title: string; detail: string; link: string }[];
  tasks: { title: string; detail: string }[];
}
