import { Skeleton } from "@/components/ui/skeleton";

export default function EssaysLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-6 w-64" />
      <div className="mt-6 flex gap-5">
        <Skeleton className="h-64 w-72 shrink-0" />
        <Skeleton className="h-64 flex-1" />
      </div>
    </div>
  );
}
