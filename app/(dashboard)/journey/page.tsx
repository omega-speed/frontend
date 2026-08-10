import { loadSeniorJourney } from "./service";
import { getApplications } from "../ollie/service";
import { getEssays } from "../essays/service";
import { GradeJourneys } from "./_components/grade-journeys";

export const metadata = { title: "Your Journey — Qoollege" };

// UX-005 — the Senior journey: applications → essays → decisions → commitment,
// one page, in season order. Server component; the client section handles the
// decision/enrollment actions (each explicitly confirmed, backend-audited).
export default async function JourneyPage() {
  const { applications, essays } = await loadSeniorJourney();

  async function reload() {
    "use server";
    const [apps, ess] = await Promise.all([getApplications(), getEssays()]);
    return {
      apps: apps.ok ? apps.applications : [],
      essays: ess.ok ? ess.essays : [],
    };
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-5">
        <p className="text-[11px] font-black uppercase text-primary">Your journey</p>
        <h1 className="text-xl font-semibold text-foreground">The right work for your year</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Explore early, plan junior year, run the season as a senior. You act; this page keeps the honest score.
        </p>
      </div>
      <GradeJourneys
        initialApps={applications.ok ? applications.applications : []}
        initialEssays={essays.ok ? essays.essays : []}
        onReloadAction={reload}
      />
    </div>
  );
}
