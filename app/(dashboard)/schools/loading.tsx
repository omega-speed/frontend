import { Skeleton } from "@/components/ui/skeleton";

export default function SchoolsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-2 h-6 w-32" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}
