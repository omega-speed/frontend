// Mirrors the backend international overlay contract (GET/PUT /international, UX-010 / SEG-GLOBAL).

export interface EnglishTestPlan {
  test: "TOEFL" | "IELTS" | "Duolingo" | "PTE" | "none-yet" | "not-needed";
  status: "planning" | "scheduled" | "done";
}

export type FundingSource = "family" | "sponsor" | "self" | "scholarship-needed";

export interface DestinationRule {
  id: string;
  ruleType: string;
  statusLabel: string;
  status: string;
  ruleText: string;
  interpretation: string | null; // labeled interpretation — never merged into the rule text
  confidence: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
}

export interface SchoolInternationalContext {
  institution: string;
  institutionId: string | null;
  // Q-Global's honest view: facts we hold (assumptions visible), gaps named.
  context: {
    institution: string;
    facts: string[];
    admissionContextNote: string; // admission ≠ immigration
    unknowns: string[];
    confidence: string;
    rulesVersion: string;
  } | null;
}

export interface InternationalOverview {
  isGlobal: boolean;
  homeCountry: string | null;
  englishTest: EnglishTestPlan | null;
  fundingSource: FundingSource | null;
  destinationPack: { destination: string; packVersion: number; covered: boolean; note: string; rules: DestinationRule[] };
  schools: SchoolInternationalContext[];
  costNote: string;
  boundaryNote: string;
  honestyNote: string;
  collaborationNote: string;
  tasks: { title: string; detail: string }[];
}
