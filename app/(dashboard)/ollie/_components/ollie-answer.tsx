"use client";

import { motion } from "framer-motion";
import type { OllieAnswer, OllieOption } from "../types";
import { OllieMark } from "./ollie-mark";
import { OllieReasoning } from "./ollie-reasoning";

// Portfolio category → its colour + how a counsellor would name it. The colour is
// the visual "chance" cue: green = you're in good shape, blue = a fair fight,
// warm/red = a stretch.
const CATEGORY: Record<string, { label: string; accent: string; text: string; tint: string }> = {
  FINANCIAL_SAFETY: { label: "Safety", accent: "var(--win)", text: "text-win", tint: "bg-win/10" },
  LIKELY: { label: "Likely", accent: "var(--win)", text: "text-win", tint: "bg-win/10" },
  TARGET: { label: "Target", accent: "var(--primary)", text: "text-primary", tint: "bg-primary/10" },
  REACH: { label: "Reach", accent: "var(--loss)", text: "text-loss", tint: "bg-loss/10" },
  HIGH_UNCERTAINTY: { label: "Unsure", accent: "var(--muted-foreground)", text: "text-muted-foreground", tint: "bg-muted" },
  SPECIAL_PATHWAY: { label: "Pathway", accent: "var(--social)", text: "text-social", tint: "bg-social/10" },
  STRATEGIC_WILDCARD: { label: "Wildcard", accent: "var(--gold)", text: "text-gold", tint: "bg-gold/10" },
};

const DOMINANT: Record<string, string> = {
  academic_fit: "academic fit",
  affordability: "affordability",
  likelihood: "your chances",
  preference: "your preferences",
};

function OptionCard({ option, index }: { option: OllieOption; index: number }) {
  const c = CATEGORY[option.category ?? ""] ?? CATEGORY.HIGH_UNCERTAINTY;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-transparent"
    >
      {/* category accent rail */}
      <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: c.accent }} aria-hidden />
      <div className="flex items-center justify-between gap-3 py-3.5 pl-5 pr-4">
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-tight">{option.institution}</p>
          <p className="truncate text-xs text-muted-foreground">{option.program}</p>
          {option.dominant && DOMINANT[option.dominant] && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              strongest on <span className="font-medium text-foreground">{DOMINANT[option.dominant]}</span>
            </p>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold uppercase ${c.tint} ${c.text}`}>
          {c.label}
        </span>
      </div>
    </motion.div>
  );
}

function Section({ label, tone = "muted", children }: { label: string; tone?: "muted" | "gold"; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={`text-[11px] font-black uppercase ${tone === "gold" ? "text-gold" : "text-muted-foreground"}`}>{label}</p>
      {children}
    </div>
  );
}

export function OllieAnswerCard({ answer }: { answer: OllieAnswer }) {
  const { synthesis, options } = answer;
  const placed = options.filter((o) => !o.abstained && o.category);
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

        {placed.length > 0 && (
          <div className="space-y-2.5">
            {placed.map((o, i) => (
              <OptionCard key={o.optionId} option={o} index={i} />
            ))}
          </div>
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
