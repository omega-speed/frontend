import { Suspense, ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import UserProfile from "@/components/molecules/user-profile";

// Every dashboard route is authenticated (reads cookies) and must render per-request.
// Without this, `next build` tries to statically prerender them, which fails.
export const dynamic = "force-dynamic";

export default async function layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <DynamicBreadcrumb />
          <div className="ml-auto flex items-center gap-4">
            <Suspense fallback={<Skeleton className="h-8 w-28" />}>
              <UserProfile />
            </Suspense>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
