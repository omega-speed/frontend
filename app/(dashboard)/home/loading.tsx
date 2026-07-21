import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-28" />
      </section>
    </div>
  );
}
