import { CornerAccents } from "@/components/ui/corner-accents";
import type { OllieAnswer, OllieOption } from "../types";

// Portfolio category → semantic token, mirroring the Matches palette so the two
// screens read as one system.
const CATEGORY: Record<string, { label: string; cls: string }> = {
  FINANCIAL_SAFETY: { label: "Financial safety", cls: "text-win bg-win/10 border-win/20" },
  LIKELY: { label: "Likely", cls: "text-win bg-win/10 border-win/20" },
  TARGET: { label: "Target", cls: "text-primary bg-primary/10 border-primary/20" },
  REACH: { label: "Reach", cls: "text-loss bg-loss/10 border-loss/20" },
  HIGH_UNCERTAINTY: { label: "High uncertainty", cls: "text-muted-foreground bg-muted border-border" },
  SPECIAL_PATHWAY: { label: "Special pathway", cls: "text-social bg-social/10 border-social/20" },
  STRATEGIC_WILDCARD: { label: "Wildcard", cls: "text-gold bg-gold/10 border-gold/20" },
};

function CategoryChip({ category }: { category: string }) {
  const c = CATEGORY[category] ?? { label: category.toLowerCase(), cls: "text-muted-foreground bg-muted border-border" };
  return <span className={`text-[10px] uppercase px-2 py-0.5 border ${c.cls}`}>{c.label}</span>;
}

function OptionRow({ option }: { option: OllieOption }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight truncate">{option.institution}</p>
        <p className="text-xs text-muted-foreground truncate">{option.program}</p>
      </div>
      {option.category ? (
        <CategoryChip category={option.category} />
      ) : (
        <span className="text-[10px] uppercase px-2 py-0.5 border text-muted-foreground bg-muted border-border">
          Not placed
        </span>
      )}
    </div>
  );
}

export function OllieAnswerCard({ answer }: { answer: OllieAnswer }) {
  const { synthesis, options } = answer;
  const placed = options.filter((o) => !o.abstained && o.category);
  const setAside = options.filter((o) => o.abstained);

  return (
    <div className="relative bg-card border border-border inset-highlight p-5 space-y-4">
      <CornerAccents />

      <div className="space-y-1.5">
        <span className="text-[11px] font-black uppercase text-primary">Ollie</span>
        <p className="text-[15px] font-semibold leading-snug">{synthesis.directAnswer}</p>
        {synthesis.whyItMatters && (
          <p className="text-sm text-muted-foreground leading-relaxed">{synthesis.whyItMatters}</p>
        )}
      </div>

      {synthesis.recommendation && (
        <p className="text-sm leading-relaxed border-l-2 border-primary/40 pl-3">
          {synthesis.recommendation}
        </p>
      )}

      {synthesis.requiresConfirmation && (
        <p className="text-sm font-semibold leading-relaxed border-l-2 border-gold/50 pl-3">
          {synthesis.requiresConfirmation}
        </p>
      )}

      {placed.length > 0 && (
        <div className="divide-y divide-border border-t border-b border-border">
          {placed.map((o) => (
            <OptionRow key={o.optionId} option={o} />
          ))}
        </div>
      )}

      {synthesis.tradeoffs.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase text-gold">Trade-offs</p>
          <ul className="space-y-0.5">
            {synthesis.tradeoffs.map((t, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {synthesis.unknowns.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase text-muted-foreground">What I don&apos;t know yet</p>
          <ul className="space-y-0.5">
            {synthesis.unknowns.map((u, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {u}
              </li>
            ))}
          </ul>
        </div>
      )}

      {setAside.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] font-black uppercase text-muted-foreground">Set aside — not enough data</p>
          <div className="divide-y divide-border">
            {setAside.map((o) => (
              <OptionRow key={o.optionId} option={o} />
            ))}
          </div>
        </div>
      )}

      {synthesis.evidence.length > 0 && (
        <details className="group">
          <summary className="text-[11px] font-black uppercase text-muted-foreground cursor-pointer select-none">
            Why — the evidence
          </summary>
          <ul className="mt-1.5 space-y-0.5">
            {synthesis.evidence.map((e, i) => (
              <li key={i} className="text-sm text-muted-foreground leading-relaxed">
                {e}
              </li>
            ))}
          </ul>
        </details>
      )}

      <div className="flex flex-col gap-1 pt-1 border-t border-border">
        {synthesis.confidence && (
          <p className="text-xs text-muted-foreground">{synthesis.confidence}</p>
        )}
        {synthesis.nextAction && (
          <p className="text-xs text-foreground font-medium">{synthesis.nextAction}</p>
        )}
      </div>
    </div>
  );
}
