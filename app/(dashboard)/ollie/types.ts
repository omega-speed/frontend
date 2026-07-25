// Mirrors the backend OllieAnswer contract (POST /ollie/ask, QIP-OLLIE-000001..010).

export type OllieIntent =
  | "MATCH_GUIDANCE"
  | "PROFILE_UPDATE"
  | "FUNDING"
  | "PROFILE_REVIEW"
  | "GENERAL";

export interface Declaration {
  category: string;
  name: string;
  value: unknown;
  label: string;
}

export interface InterpretedIntent {
  intent: OllieIntent;
  outcome: string;
  rationale: string;
  signals: string[];
}

export interface OrchestrationStep {
  domain: string;
  action: string;
  reason: string;
}

export interface OrchestrationPlan {
  requestId: string;
  interpretedIntent: string;
  learnerOutcome: string;
  consequenceClass: string;
  riskClass: string;
  requiredDomains: string[];
  contextCategories: string[];
  steps: OrchestrationStep[];
  confirmationRequired: boolean;
  stoppingConditions: string[];
}

export interface Synthesis {
  directAnswer: string;
  whyItMatters?: string;
  recommendation?: string;
  evidence: string[];
  assumptions: string[];
  confidence: string;
  tradeoffs: string[];
  nextAction?: string;
  unknowns: string[];
  requiresConfirmation?: string;
}

export interface OllieOption {
  optionId: string;
  program: string;
  institution: string;
  category: string | null;
  dominant: string | null;
  abstained: boolean;
}

// One data-backed line of the "why": the factor, the evidence tying your facts to
// the school's, and how sure Ollie is.
export interface ShortlistFactor {
  label: string;
  detail: string;
  confidence: string;
}

// The side shortlist (GET /ollie/shortlist) — schools + why, shown in the panel.
export interface ShortlistItem {
  optionId: string;
  institution: string;
  program: string;
  category: string | null;
  reasons: string[];
  breakdown: ShortlistFactor[];
}

export interface ShortlistView {
  ready: boolean;
  needs: string[];
  progress: { field: boolean; degree: boolean; budget: boolean };
  options: ShortlistItem[];
}

// "About you" (GET /ollie/about) — what Ollie knows, split into what's shaping the
// shortlist vs what's noted but not yet influencing it.
export interface AboutFact {
  label: string;
  value: string;
}

export interface AboutView {
  using: AboutFact[];
  noted: AboutFact[];
}

export interface OllieAnswer {
  interpreted: InterpretedIntent;
  plan: OrchestrationPlan;
  synthesis: Synthesis;
  options: OllieOption[];
  proposals?: Declaration[]; // SENSITIVE change awaiting explicit Save/Not now
  saved?: Declaration[]; // low-stakes fact already auto-saved this turn — offer Undo
  // Claude's conversational delivery of the (deterministic) synthesis, when
  // available. The facts still live in `synthesis`/`options`; this only rewords.
  voice?: string;
  form?: { missing: string[] }; // Ollie needs several essentials → show the quick intake form
}
