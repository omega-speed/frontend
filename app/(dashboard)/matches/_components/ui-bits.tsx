import type { Confidence, DimensionKey, PortfolioCategory } from "../types";

// Confidence → semantic token (DESIGN.md). Coarse levels, never false precision.
const CONFIDENCE: Record<Confidence, { label: string; cls: string }> = {
  HIGH: { label: "High confidence", cls: "text-win bg-win/10 border-win/20" },
  MODERATE: { label: "Moderate confidence", cls: "text-primary bg-primary/10 border-primary/20" },
  LOW: { label: "Low confidence", cls: "text-gold bg-gold/10 border-gold/20" },
  INSUFFICIENT: { label: "Not enough data", cls: "text-muted-foreground bg-muted border-border" },
};

export function ConfidenceBadge({ level }: { level: Confidence }) {
  const c = CONFIDENCE[level];
  return (
    <span className={`text-[10px] uppercase px-2 py-0.5 border ${c.cls}`}>{c.label}</span>
  );
}

const CATEGORY: Record<PortfolioCategory, { label: string; cls: string }> = {
  FINANCIAL_SAFETY: { label: "Financial safety", cls: "text-win bg-win/10 border-win/20" },
  LIKELY: { label: "Likely", cls: "text-win bg-win/10 border-win/20" },
  TARGET: { label: "Target", cls: "text-primary bg-primary/10 border-primary/20" },
  REACH: { label: "Reach", cls: "text-loss bg-loss/10 border-loss/20" },
  HIGH_UNCERTAINTY: { label: "High uncertainty", cls: "text-muted-foreground bg-muted border-border" },
  SPECIAL_PATHWAY: { label: "Special pathway", cls: "text-social bg-social/10 border-social/20" },
  STRATEGIC_WILDCARD: { label: "Wildcard", cls: "text-gold bg-gold/10 border-gold/20" },
};

export function CategoryChip({ category }: { category: PortfolioCategory }) {
  const c = CATEGORY[category];
  return <span className={`text-[10px] uppercase px-2 py-0.5 border ${c.cls}`}>{c.label}</span>;
}

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  academic_fit: "Academic fit",
  affordability: "Affordability",
  likelihood: "Admission likelihood",
  preference: "Preference",
};

// A thin value bar. A null value shows "unknown" rather than an empty/zero bar —
// missing data is never rendered as a low score.
export function ValueBar({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-[11px] text-muted-foreground">Unknown</span>;
  }
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-24 bg-muted overflow-hidden">
        <span className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${Math.round(value * 100)}%` }} />
      </span>
      <span className="text-[11px] tabular-nums text-muted-foreground">{Math.round(value * 100)}</span>
    </span>
  );
}
