import { getGrad } from "./service";
import { GradWorkspace } from "./_components/grad-workspace";

// UX-009 · SEG-GRAD — grad studies as its own experience: the coursework vs
// research fork, supervisor outreach, and the graduate versions of funding,
// statements, and applications.
export const dynamic = "force-dynamic";

export default async function GradPage() {
  const res = await getGrad();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-2xl bg-loss/10 px-4 py-3 text-sm text-loss">{res.message}</p>
      </div>
    );
  }
  return <GradWorkspace initial={res.view} />;
}
