import { CornerAccents } from "@/components/ui/corner-accents";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { getMatchesData } from "./service";
import { MatchCard } from "./_components/match-card";
import { PortfolioBand } from "./_components/portfolio-band";

// Per-request: reads the signed-in learner's matches, ranking, and portfolio.
export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const { matches, ranked, portfolio, meta } = await getMatchesData();

  const byId = new Map(matches.map((m) => [m.optionId, m]));
  // Order by the ranking; fall back to the raw match order.
  const ordered = ranked.length
    ? ranked.map((r) => byId.get(r.optionId)).filter((m): m is NonNullable<typeof m> => !!m)
    : matches;

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <span className="text-[11px] font-black uppercase text-primary">Q-Match</span>
        <h2 className="text-lg font-semibold">Your matches</h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          We score each program on fit, affordability and admission chances
          separately — never one hidden number — and only as far as the data
          allows. Where we don&apos;t know enough, we say so.
        </p>
      </section>

      {matches.length === 0 ? (
        <div className="relative bg-card border border-border p-6">
          <CornerAccents />
          <p className="text-sm text-muted-foreground leading-relaxed">
            No matches yet. Fill in your profile (GPA, budget, what you want to
            study) and we&apos;ll build your matches — or run{" "}
            <span className="text-foreground font-semibold">npm run seed:demo</span>{" "}
            on the backend to load a demo learner.
          </p>
        </div>
      ) : (
        <>
          {portfolio && <PortfolioBand portfolio={portfolio} meta={meta} />}

          <section className="space-y-4">
            <h3 className="font-semibold">Ranked options</h3>
            <StaggerReveal className="grid gap-4">
              {ordered.map((m) => (
                <StaggerItem key={m.id}>
                  <MatchCard match={m} meta={meta[m.optionId]} />
                </StaggerItem>
              ))}
            </StaggerReveal>
          </section>
        </>
      )}
    </div>
  );
}
