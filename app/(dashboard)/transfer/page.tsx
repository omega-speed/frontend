import { getTransfer } from "./service";
import { TransferWorkspace } from "./_components/transfer-workspace";

// UX-008 · SEG-TRANSFER — the transfer experience: course-level credits, a
// ranged retention estimate with stated confidence, and revised time to degree.
export const dynamic = "force-dynamic";

export default async function TransferPage() {
  const res = await getTransfer();
  if (!res.ok) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <p className="rounded-2xl bg-loss/10 px-4 py-3 text-sm text-loss">{res.message}</p>
      </div>
    );
  }
  return <TransferWorkspace initial={res.view} />;
}
