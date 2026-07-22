import { CornerAccents } from "@/components/ui/corner-accents";
import type { DimensionKey, MatchResult, OptionMeta } from "../types";
import { ConfidenceBadge, DIMENSION_LABELS, ValueBar } from "./ui-bits";

const ORDER: DimensionKey[] = ["academic_fit", "likelihood", "affordability", "preference"];

export function MatchCard({ match, meta }: { match: MatchResult; meta?: OptionMeta }) {
  const scored = ORDER.filter((k) => match.dimensions[k]);

  return (
    <div className="relative bg-card border border-border inset-highlight p-5">
      <CornerAccents />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="font-semibold leading-tight">{meta?.programName ?? "Program"}</h3>
          <p className="text-xs text-muted-foreground">
            {meta?.institutionName ?? "—"}
            {meta?.degreeLevel ? ` · ${meta.degreeLevel.toLowerCase()}` : ""}
          </p>
        </div>
        <ConfidenceBadge level={match.confidence} />
      </div>

      {/* Dimensions — kept separate, each with its own value + confidence. */}
      <div className="mt-4 space-y-2">
        {scored.map((key) => {
          const d = match.dimensions[key]!;
          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-[11px] uppercase text-muted-foreground w-40 shrink-0">
                {DIMENSION_LABELS[key]}
              </span>
              <ValueBar value={d.value} />
              <span className="ml-auto text-[10px] uppercase text-muted-foreground/70">
                {d.confidence === "INSUFFICIENT" ? "—" : d.confidence.toLowerCase()}
              </span>
            </div>
          );
        })}
        {scored.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Not enough data to score this option yet.
          </p>
        )}
      </div>

      {match.tradeoffs.length > 0 && (
        <ul className="mt-4 space-y-1 border-t border-border pt-3">
          {match.tradeoffs.map((t, i) => (
            <li key={i} className="text-xs text-loss/90 leading-relaxed">
              {t}
            </li>
          ))}
        </ul>
      )}
      {match.assumptions.length > 0 && (
        <ul className="mt-2 space-y-1">
          {match.assumptions.map((a, i) => (
            <li key={i} className="text-[11px] text-muted-foreground leading-relaxed">
              {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
