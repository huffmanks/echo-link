import { Outlet } from "@tanstack/react-router";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

import { AppSidebar } from "@/components//blocks/sidebar/app-sidebar";
import { SiteHeader } from "@/components//blocks/sidebar/site-header";
import AppMobileNav from "@/components/blocks/sidebar/app-mobile-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Sidebar() {
  const isMobile = useIsMobile();
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          {isMobile ? <AppMobileNav /> : <AppSidebar />}
          <SidebarInset className="min-w-0">
            <div className={cn(isMobile ? "p-2 pb-28" : "p-4")}>
              <Outlet />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
