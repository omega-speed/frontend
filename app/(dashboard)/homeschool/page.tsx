import { getHomeschool } from "./service";
import { HomeschoolWorkspace } from "./_components/homeschool-workspace";

// UX-006 · SEG-HOME — the homeschool experience: transcript, school profile,
// outside evaluators, and the tasks that need someone beyond the household.
// Server component: fetch once, hand to the client workspace.
export const dynamic = "force-dynamic";

export default async function HomeschoolPage() {
  const res = await getHomeschool();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-2xl bg-loss/10 px-4 py-3 text-sm text-loss">{res.message}</p>
      </div>
    );
  }
  return <HomeschoolWorkspace initial={res.view} />;
}
