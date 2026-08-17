// Mirrors the backend OllieAnswer contract (POST /ollie/ask, QIP-OLLIE-000001..010).

export type OllieIntent =
  | "MATCH_GUIDANCE"
  | "PROFILE_UPDATE"
  | "FUNDING"
  | "ATHLETICS"
  | "SCHOOL_INFO"
  | "SHORTLIST_EDIT"
  | "APPLICATIONS"
  | "ESSAY"
  | "GLOBAL"
  | "CAREER"
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
  // v3 fit transparency: this dimension's 0-100 value and its weight.
  // fit = round(weighted average of counted rows); null = not counted, never a penalty.
  value: number | null;
  weight: number;
}

// The side shortlist (GET /ollie/shortlist) — schools + why, shown in the panel.
export interface ShortlistItem {
  optionId: string;
  // Links the row to its school page (/schools/[id]); null if unresolved.
  institutionId: string | null;
  institution: string;
  // null while the learner is undecided — the card is the SCHOOL, no course tag.
  program: string | null;
  category: string | null;
  fitScore: number | null; // 0–100 vs the learner's OWN criteria — never admit odds
  reasons: string[];
  breakdown: ShortlistFactor[];
  // Sports the learner cares about that this school also fields (Q-Athlete cross-ref).
  athletics: { sport: string; division: string | null }[];
  // True on THE school the learner committed to — it leads the list.
  committed?: boolean;
}

export interface ShortlistView {
  ready: boolean;
  needs: string[];
  progress: { field: boolean; degree: boolean; budget: boolean };
  options: ShortlistItem[];
  // AI-written one-line read on the list as a whole (replaces the static banner).
  note?: string;
  // OL-005: cross-domain tensions, both truths kept — never averaged into fake
  // consensus — plus a human-escalation line for high-consequence conflicts.
  conflicts?: { optionId: string | null; severity: "MODERATE" | "HIGH"; statement: string }[];
  escalation?: string | null;
  // Set when the learner has committed to a school — the list is then
  // "your school + backups" and the other tabs plan around it.
  committed?: { institutionId: string; institution: string } | null;
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
  // v3 funding hero: honest "up to" total across the may-qualify awards shown.
  totalUpTo?: number;
  fafsa?: { state: "now" | "senior-fall" | "later"; line: string };
  // Sticker vs typical net per shortlist school — estimates, never promises.
  netCosts?: { institution: string; stickerPerYear: number | null; netPerYear: number | null }[];
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
  completeness: { percent: number; nextHint: string; knownCount: number };
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
  suggestions?: string[]; // tappable next moves from real gaps
  scoringChanged?: boolean; // this turn saved a fact the matcher scores on
  // OL-006: a consequential action awaiting the learner's explicit yes — render
  // Confirm / Not now; a typed "yes"/"not now" works the same.
  pendingAction?: { actionId: string; kind: string; summary: string };
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

// ---- Q-Admit: the learner's application trackers (QA-001…QA-003) ----

export type ApplicationStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "READY"
  | "SUBMITTED"
  | "CONFIRMED"
  | "DECIDED"
  | "ENROLLED"
  | "WITHDRAWN";

export interface ApplicationSummary {
  id: string;
  institutionId: string;
  programId: string | null;
  cycle: string;
  round: string | null;
  status: ApplicationStatus;
  statusReason: string | null;
  createdAt: string;
}

export interface ApplicationRequirementRow {
  id: string;
  requirementKey: string;
  requirementType: string;
  status: "UNKNOWN" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "WAIVED" | "NOT_APPLICABLE";
  mandatory: boolean;
  detail: Record<string, unknown> | null;
  dueAt: string | null;
  confidence: string;
}

export interface ApplicationDeadlineRow {
  id: string;
  deadlineType: string;
  dueAt: string;
  timezone: string; // "UNKNOWN" when the source doesn't state one — treat as earlier than it looks
  estimated: boolean;
}

export interface ApplicationDetail extends ApplicationSummary {
  requirements: ApplicationRequirementRow[];
  deadlines: ApplicationDeadlineRow[];
}

// GET /q-admit/applications/{id}/readiness — operational honesty, never a
// chance of admission (QADMIT-READY-000009).
export interface ApplicationReadiness {
  applicationId: string;
  overallState: "READY" | "ON_TRACK" | "AT_RISK" | "BLOCKED" | "SUBMITTED" | "INSUFFICIENT_DATA";
  dimensions: Record<string, { state: string; note: string | null }>;
  blockers: string[];
  warnings: string[];
  confidence: string;
  evaluatedAt: string;
}

export interface TrackedApplication {
  application: ApplicationDetail;
  readiness: ApplicationReadiness | null;
  school: string; // resolved institution name
}
