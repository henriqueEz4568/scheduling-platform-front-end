import { useEffect, useState, type ReactElement } from "react";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { AppLayoutProps } from "@/types/layout";

/** Cookie written by the shadcn/ui SidebarProvider. */
const SIDEBAR_COOKIE = "sidebar_state";

export function AppLayout({ children }: AppLayoutProps) {
  // Pages are static, so the saved state is applied after mount.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (document.cookie.split("; ").includes(`${SIDEBAR_COOKIE}=false`)) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={setSidebarOpen}
      className="flex-col [--header-height:4rem]"
    >
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <SidebarInset className="min-w-0">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}

/** getLayout for pages under /dashboard. */
export function getAppLayout(page: ReactElement) {
  return <AppLayout>{page}</AppLayout>;
}
