import { Skeleton } from "@/components/ui/skeleton";

export default function JourneyLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-6 w-72" />
      <Skeleton className="mt-2 h-4 w-96" />
      <div className="mt-6 flex flex-col gap-5">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
}
