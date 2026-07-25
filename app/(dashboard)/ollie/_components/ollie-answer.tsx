import type { OllieAnswer, OllieOption } from "../types";
import { OllieMark } from "./ollie-mark";
import { OllieReasoning } from "./ollie-reasoning";

// Portfolio category → semantic token + label. Mirrors the palette so reaches,
// targets and safeties read consistently.
const CATEGORY: Record<string, { label: string; cls: string }> = {
  FINANCIAL_SAFETY: { label: "Financial safety", cls: "text-win bg-win/10 border-win/25" },
  LIKELY: { label: "Likely", cls: "text-win bg-win/10 border-win/25" },
  TARGET: { label: "Target", cls: "text-primary bg-primary/10 border-primary/25" },
  REACH: { label: "Reach", cls: "text-loss bg-loss/10 border-loss/25" },
  HIGH_UNCERTAINTY: { label: "Needs more data", cls: "text-muted-foreground bg-muted border-border" },
  SPECIAL_PATHWAY: { label: "Pathway", cls: "text-social bg-social/10 border-social/25" },
  STRATEGIC_WILDCARD: { label: "Wildcard", cls: "text-gold bg-gold/10 border-gold/25" },
};

function CategoryChip({ category }: { category: string }) {
  const c = CATEGORY[category] ?? {
    label: category.toLowerCase(),
    cls: "text-muted-foreground bg-muted border-border",
  };
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase ${c.cls}`}>
      {c.label}
    </span>
  );
}

function OptionRow({ option }: { option: OllieOption }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight">{option.institution}</p>
        <p className="truncate text-xs text-muted-foreground">{option.program}</p>
      </div>
      {option.category ? (
        <CategoryChip category={option.category} />
      ) : (
        <span className="shrink-0 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
          Not placed
        </span>
      )}
    </div>
  );
}

function Section({
  label,
  tone = "muted",
  children,
}: {
  label: string;
  tone?: "muted" | "gold";
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <p className={`text-[11px] font-black uppercase ${tone === "gold" ? "text-gold" : "text-muted-foreground"}`}>
        {label}
      </p>
      {children}
    </div>
  );
}

export function OllieAnswerCard({ answer }: { answer: OllieAnswer }) {
  const { synthesis, options } = answer;
  const placed = options.filter((o) => !o.abstained && o.category);
  const setAside = options.filter((o) => o.abstained);
  // When Ollie has a conversational voice, it leads and subsumes the templated
  // prose (direct answer / why / recommendation). The structured facts below stay.
  const spoken = answer.voice?.trim();

  return (
    <div className="flex items-start gap-3">
      <OllieMark />
      <div className="min-w-0 flex-1 space-y-4">
        <span className="text-[11px] font-black uppercase text-primary">Ollie</span>

        {spoken ? (
          <div className="space-y-2 text-[15px] leading-relaxed text-foreground">
            {spoken.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-[15px] font-semibold leading-snug text-foreground">
                {synthesis.directAnswer}
              </p>
              {synthesis.whyItMatters && (
                <p className="text-sm leading-relaxed text-muted-foreground">{synthesis.whyItMatters}</p>
              )}
            </div>

            {synthesis.recommendation && (
              <p className="border-l-2 border-primary/50 pl-3 text-sm leading-relaxed">
                {synthesis.recommendation}
              </p>
            )}
          </>
        )}

        {!spoken && synthesis.requiresConfirmation && (
          <p className="border-l-2 border-gold/60 pl-3 text-sm font-semibold leading-relaxed">
            {synthesis.requiresConfirmation}
          </p>
        )}

        {placed.length > 0 && (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {placed.map((o) => (
              <OptionRow key={o.optionId} option={o} />
            ))}
          </div>
        )}

        {synthesis.tradeoffs.length > 0 && (
          <Section label="Trade-offs" tone="gold">
            <ul className="space-y-0.5">
              {synthesis.tradeoffs.map((t, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {t}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {synthesis.unknowns.length > 0 && (
          <Section label="What I don't know yet">
            <ul className="space-y-0.5">
              {synthesis.unknowns.map((u, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {u}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {setAside.length > 0 && (
          <Section label="Set aside — not enough data">
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {setAside.map((o) => (
                <OptionRow key={o.optionId} option={o} />
              ))}
            </div>
          </Section>
        )}

        {synthesis.evidence.length > 0 && (
          <Section label="The evidence">
            <ul className="space-y-0.5">
              {synthesis.evidence.map((e, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {e}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <OllieReasoning answer={answer} />

        {(synthesis.confidence || (!spoken && synthesis.nextAction)) && (
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            {synthesis.confidence && (
              <p className="text-xs text-muted-foreground">{synthesis.confidence}</p>
            )}
            {!spoken && synthesis.nextAction && (
              <p className="text-xs font-medium text-foreground">{synthesis.nextAction}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
