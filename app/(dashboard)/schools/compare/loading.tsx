import { Skeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-6 w-48" />
      <Skeleton className="mt-5 h-96 w-full" />
    </div>
  );
}
