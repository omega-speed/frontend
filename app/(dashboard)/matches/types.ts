// Mirrors the backend Q-Match contracts (QMATCH-MPTS). Dimensions are kept
// separate — there is no single "score" — and confidence is a coarse level.

export type Confidence = "INSUFFICIENT" | "LOW" | "MODERATE" | "HIGH";

export interface DimensionState {
  value: number | null; // 0..1, or null = unknown (never "weak")
  confidence: Confidence;
  rationale?: string;
}

export type DimensionKey =
  | "academic_fit"
  | "affordability"
  | "likelihood"
  | "preference";

export interface MatchResult {
  id: string;
  optionId: string;
  optionType: "INSTITUTION" | "PROGRAM" | "PATHWAY";
  dimensions: Partial<Record<DimensionKey, DimensionState>>;
  assumptions: string[];
  tradeoffs: string[];
  evidenceRefs: string[];
  confidence: Confidence;
}

export interface RankedOption {
  optionId: string;
  composite: number | null;
  confidence: Confidence;
  dominant: string | null;
  abstained: boolean;
}

export type PortfolioCategory =
  | "LIKELY"
  | "TARGET"
  | "REACH"
  | "HIGH_UNCERTAINTY"
  | "SPECIAL_PATHWAY"
  | "FINANCIAL_SAFETY"
  | "STRATEGIC_WILDCARD";

export interface PortfolioOption {
  optionId: string;
  category: PortfolioCategory;
  locked: boolean;
  rationale: string[];
}

export interface Portfolio {
  id: string;
  objective: string | null;
  status: string;
  risks: string[];
  options: PortfolioOption[];
}

// A program resolved to its display name + institution + facts, for the UI.
export interface OptionMeta {
  optionId: string;
  programName: string;
  institutionName: string;
  degreeLevel: string;
}

export interface MatchesData {
  matches: MatchResult[];
  ranked: RankedOption[];
  portfolio: Portfolio | null;
  meta: Record<string, OptionMeta>;
}
