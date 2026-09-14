import * as React from "react";

import { Link, useLocation } from "@tanstack/react-router";
import { ExternalLinkIcon } from "lucide-react";

import { SIDEBAR_NAV_SECONDARY } from "@/lib/constants";
import { useSettingsStore } from "@/lib/store/settings";
import { checkActive, joinUrlPath } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavSecondary({
  ...props
}: {} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const linkdingExternalUrl = useSettingsStore((state) => state.linkdingExternalUrl);

  const items = React.useMemo(() => {
    return SIDEBAR_NAV_SECONDARY.map((item) => {
      const newItem = { ...item };

      if (!linkdingExternalUrl) return newItem;

      if (newItem.isExternal) {
        newItem.url = joinUrlPath(linkdingExternalUrl, newItem.url || null);
      } else {
        return {
          ...newItem,
          isActive: checkActive({ pathname, url: newItem.url }),
        };
      }

      return newItem;
    });
  }, [linkdingExternalUrl, pathname]);

  function handleCloseSidebar(isExternal: boolean) {
    if (isExternal || !isMobile) return;

    setOpenMobile(false);
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.slice(0, 2).map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                size="sm"
                isActive={item.isActive}
                render={
                  <Link
                    className="justify-between"
                    to={item.url}
                    target={item.isExternal ? "_blank" : "_self"}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => handleCloseSidebar(!!item.isExternal)}>
                    <div className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.name}</span>
                    </div>
                    {item.isExternal && <ExternalLinkIcon />}
                  </Link>
                }></SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <SidebarSeparator className="my-2" />
      <SidebarGroupContent>
        <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs font-normal tracking-wide uppercase">
          Linkding
        </SidebarGroupLabel>
        <SidebarMenu>
          {items.slice(2).map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                size="sm"
                render={
                  <Link
                    className="justify-between"
                    to={item.url}
                    target={item.isExternal ? "_blank" : "_self"}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                    onClick={() => handleCloseSidebar(!!item.isExternal)}>
                    <div className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.name}</span>
                    </div>
                    {item.isExternal && <ExternalLinkIcon />}
                  </Link>
                }></SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
