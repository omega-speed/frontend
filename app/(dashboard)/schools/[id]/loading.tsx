import { Skeleton } from "@/components/ui/skeleton";

export default function SchoolLoading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-80 max-w-full" />
      <Skeleton className="mt-2 h-4 w-56" />
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
      <Skeleton className="mt-3 h-48 w-full" />
    </div>
  );
}
