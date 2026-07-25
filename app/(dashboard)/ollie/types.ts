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
  // How private the fact is; Ollie sets it and it round-trips back on confirm so
  // the twin can gate it. "SENSITIVE" for things like financial need or first-gen.
  sensitivity?: "PERSONAL" | "SENSITIVE";
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
}
