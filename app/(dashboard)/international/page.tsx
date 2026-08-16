import { getInternational } from "./service";
import { InternationalWorkspace } from "./_components/international-workspace";

// UX-010 · SEG-GLOBAL — the Global overlay: the same product through
// international eyes. Process guidance with a firm legal boundary.
export const dynamic = "force-dynamic";

export default async function InternationalPage() {
  const res = await getInternational();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-2xl bg-loss/10 px-4 py-3 text-sm text-loss">{res.message}</p>
      </div>
    );
  }
  return <InternationalWorkspace initial={res.view} />;
}
