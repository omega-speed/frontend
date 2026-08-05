// Mirrors the backend OllieAnswer contract (POST /ollie/ask, QIP-OLLIE-000001..010).

export type OllieIntent =
  | "MATCH_GUIDANCE"
  | "PROFILE_UPDATE"
  | "FUNDING"
  | "ATHLETICS"
  | "SCHOOL_INFO"
  | "SHORTLIST_EDIT"
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
  // Links the row to its school page (/schools/[id]); null if unresolved.
  institutionId: string | null;
  institution: string;
  program: string;
  category: string | null;
  reasons: string[];
  breakdown: ShortlistFactor[];
  // Sports the learner cares about that this school also fields (Q-Athlete cross-ref).
  athletics: { sport: string; division: string | null }[];
}

export interface ShortlistView {
  ready: boolean;
  needs: string[];
  progress: { field: boolean; degree: boolean; budget: boolean };
  options: ShortlistItem[];
  // AI-written one-line read on the list as a whole (replaces the static banner).
  note?: string;
}

// One assessed award on the Funding tab (GET /ollie/funding).
export interface FundingAward {
  id: string;
  name: string;
  sponsor: string;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  outcome: string;
  priority: string;
  expectedValue: number | null;
  why: string[];
  openQuestions: string[];
  schoolTied: string | null;
  renewable: boolean | null;
  url: string | null;
}
export interface FundingView {
  ready: boolean;
  awards: FundingAward[];
}

// The journey: one dated timeline of school deadlines, funding deadlines, and
// do-now tasks (GET /ollie/journey).
export interface JourneyItem {
  kind: "DEADLINE" | "FUNDING" | "TASK";
  date: string | null; // yyyy-mm-dd; null for do-anytime tasks
  projected: boolean; // rolled forward from a past cycle — verify with the school
  school: string | null;
  institutionId: string | null;
  title: string;
  detail: string;
  urgent: boolean;
}

export interface JourneyView {
  ready: boolean;
  focus: { institutionId: string; name: string; pinned: boolean }[];
  items: JourneyItem[];
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

// One saved turn of the Ollie transcript (GET /ollie/conversation). Session memory
// so a reload keeps the thread; the facts still live on the twin, not here.
export interface ConversationMessage {
  id: string;
  role: "USER" | "OLLIE";
  text: string | null;
  answer: OllieAnswer | null; // present on OLLIE turns, so the card rehydrates
  at: string;
}
