import { getGed } from "./service";
import { GedWorkspace } from "./_components/ged-workspace";

// UX-007 · SEG-GED — GED-to-college: completion planning and transition
// doorways (community college, career/technical, four-year). No test prep.
export const dynamic = "force-dynamic";

export default async function GedPage() {
  const res = await getGed();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-2xl bg-loss/10 px-4 py-3 text-sm text-loss">{res.message}</p>
      </div>
    );
  }
  return <GedWorkspace initial={res.view} />;
}
