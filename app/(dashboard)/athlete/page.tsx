import { getAthlete } from "./service";
import { AthleteWorkspace } from "./_components/athlete-workspace";

// UX-011 · SEG-ATH — the Athlete-Recruit overlay: one profile, one plan; the
// recruiting ladder's rungs kept distinct and never guaranteed.
export const dynamic = "force-dynamic";

export default async function AthletePage() {
  const res = await getAthlete();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-2xl bg-loss/10 px-4 py-3 text-sm text-loss">{res.message}</p>
      </div>
    );
  }
  return <AthleteWorkspace initial={res.view} />;
}
