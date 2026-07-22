import { CornerAccents } from "@/components/ui/corner-accents";
import type { OptionMeta, Portfolio } from "../types";
import { CategoryChip } from "./ui-bits";

// The balanced portfolio: a coordinated set, not one "best" school. Shows each
// option's category and the set-level risks Q-Match flagged.
export function PortfolioBand({ portfolio, meta }: { portfolio: Portfolio; meta: Record<string, OptionMeta> }) {
  return (
    <div className="relative bg-card border border-border inset-highlight p-5">
      <CornerAccents />
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[11px] font-black uppercase text-primary">Your portfolio</span>
        {portfolio.objective && (
          <span className="text-xs text-muted-foreground">{portfolio.objective}</span>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {portfolio.options.map((o) => (
          <div key={o.optionId} className="flex items-center justify-between gap-3 border border-border px-3 py-2">
            <span className="text-sm truncate">{meta[o.optionId]?.programName ?? "Program"}</span>
            <CategoryChip category={o.category} />
          </div>
        ))}
      </div>

      {portfolio.risks.length > 0 && (
        <div className="mt-4 border-t border-border pt-3 space-y-1">
          {portfolio.risks.map((r, i) => (
            <p key={i} className="text-xs text-gold leading-relaxed">
              {r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
