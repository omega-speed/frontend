import { Skeleton } from "@/components/ui/skeleton";

// Shown while the page fetches the saved transcript. Mirrors the two-pane layout
// so there's no blank flash before the conversation and shortlist appear.
export default function Loading() {
  return (
    <div className="flex h-[calc(100svh-3.5rem)]">
      <div className="min-w-0 flex-1">
        <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 text-center">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <aside className="hidden w-90 shrink-0 border-l border-border lg:block xl:w-100">
        <div className="space-y-4 p-5">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </aside>
    </div>
  );
}
