"use client";

import type { OllieAnswer } from "../types";
import { OllieMark } from "./ollie-mark";
import { OllieReasoning } from "./ollie-reasoning";

function Section({ label, tone = "muted", children }: { label: string; tone?: "muted" | "gold"; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={`text-[11px] font-black uppercase ${tone === "gold" ? "text-gold" : "text-muted-foreground"}`}>{label}</p>
      {children}
    </div>
  );
}

export function OllieAnswerCard({ answer }: { answer: OllieAnswer }) {
  const { synthesis } = answer;
  const spoken = answer.voice?.trim();

  return (
    <div className="flex items-start gap-3">
      <OllieMark />
      <div className="min-w-0 flex-1 space-y-4">
        <span className="bg-linear-to-r from-primary to-[#6d5efc] bg-clip-text text-[11px] font-black uppercase text-transparent">
          Ollie
        </span>

        {spoken ? (
          <div className="space-y-2 text-[15px] leading-relaxed text-foreground">
            {spoken.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <p className="text-[15px] font-semibold leading-snug text-foreground">{synthesis.directAnswer}</p>
              {synthesis.whyItMatters && (
                <p className="text-sm leading-relaxed text-muted-foreground">{synthesis.whyItMatters}</p>
              )}
            </div>
            {synthesis.recommendation && (
              <p className="border-l-2 border-primary/50 pl-3 text-sm leading-relaxed">{synthesis.recommendation}</p>
            )}
          </>
        )}

        {!spoken && synthesis.requiresConfirmation && (
          <p className="border-l-2 border-gold/60 pl-3 text-sm font-semibold leading-relaxed">{synthesis.requiresConfirmation}</p>
        )}

        {synthesis.tradeoffs.length > 0 && (
          <Section label="Trade-offs" tone="gold">
            <ul className="space-y-0.5">
              {synthesis.tradeoffs.map((t, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">{t}</li>
              ))}
            </ul>
          </Section>
        )}

        {synthesis.unknowns.length > 0 && (
          <Section label="What I don't know yet">
            <ul className="space-y-0.5">
              {synthesis.unknowns.map((u, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">{u}</li>
              ))}
            </ul>
          </Section>
        )}

        {synthesis.evidence.length > 0 && (
          <Section label="The evidence">
            <ul className="space-y-0.5">
              {synthesis.evidence.map((e, i) => (
                <li key={i} className="text-sm leading-relaxed text-muted-foreground">{e}</li>
              ))}
            </ul>
          </Section>
        )}

        <OllieReasoning answer={answer} />

        {synthesis.confidence && (
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">{synthesis.confidence}</p>
            {!spoken && synthesis.nextAction && (
              <p className="mt-1 text-xs font-medium text-foreground">{synthesis.nextAction}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
