"use client";

import { useEffect, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRightIcon, FolderIcon, HashIcon } from "lucide-react";

import { SIDEBAR_NAV_MAIN } from "@/lib/constants";
import { getAllQueryOptions } from "@/lib/queries";
import { useSettingsStore } from "@/lib/store";
import { checkActive } from "@/lib/utils";
import { useGlobalModal } from "@/providers/global-modal-context";
import type { SidebarNavItem, SidebarSubNavItem } from "@/types";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain() {
  const { data: folders } = useSuspenseQuery(getAllQueryOptions.folders);
  const { data: tags } = useSuspenseQuery(getAllQueryOptions.tags);

  const { isMobile, setOpenMobile } = useSidebar();
  const { pathname } = useLocation();

  const folderItems =
    folders?.results
      .sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA - orderB;
      })
      .map((item) => {
        const url = `/dashboard/folders/${item.id}`;

        return {
          name: item.name,
          url,
          isActive: checkActive({ pathname, url }),
        };
      }) || [];

  const tagItems =
    tags?.results
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => {
        const url = `/dashboard/tags/${item.name}`;
        return {
          name: item.name,
          url,
          isActive: checkActive({ pathname, url }),
        };
      }) || [];

  const folderHasItems = folderItems.length > 0;
  const tagHasItems = tagItems.length > 0;

  const items = [
    ...SIDEBAR_NAV_MAIN.map((item) => {
      const subItems =
        item.items?.map((sub) => ({
          ...sub,
          isActive: checkActive({ pathname, url: sub.url }),
        })) || [];

      return {
        ...item,
        isActive: checkActive({ pathname, url: item.url }),
        items: subItems,
      };
    }),
    {
      name: "Folders",
      url: "/dashboard/folders",
      icon: FolderIcon,
      isActive: folderItems.some((folder) => folder.isActive),
      isCollapsible: true,
      items: folderHasItems ? folderItems : [],
    },
    {
      name: "Tags",
      url: "/dashboard/tags",
      icon: HashIcon,
      isActive: tagItems.some((tag) => tag.isActive),
      isCollapsible: true,
      items: tagHasItems ? tagItems : [],
    },
  ] as Array<SidebarNavItem>;

  function handleCloseSidebar() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  function renderSidebarItem(item: SidebarNavItem) {
    if (item.isCollapsible && item?.items?.length) {
      return (
        <NavCollapsibleItem key={item.name} item={item} handleCloseSidebar={handleCloseSidebar} />
      );
    }

    if (item.url) {
      return <NavLinkItem key={item.name} item={item} handleCloseSidebar={handleCloseSidebar} />;
    }

    return null;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="sr-only">Items</SidebarGroupLabel>
      <SidebarMenu>{items.map(renderSidebarItem)}</SidebarMenu>
    </SidebarGroup>
  );
}

function NavLinkItem({
  item,
  handleCloseSidebar,
}: {
  item: SidebarNavItem;
  handleCloseSidebar: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={item.isActive}
        render={
          <Link to={item.url} onClick={handleCloseSidebar}>
            <item.icon />
            <span>{item.name}</span>
          </Link>
        }></SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SubNavItems({
  items = [],
  handleCloseSidebar,
}: {
  items?: Array<SidebarSubNavItem>;
  handleCloseSidebar: () => void;
}) {
  const { setActiveGlobalDialog } = useGlobalModal();

  function handleClick() {
    handleCloseSidebar();
    setActiveGlobalDialog("tag-form");
  }
  return (
    <>
      {items.map((subItem) => (
        <SidebarMenuSubItem key={subItem.name}>
          {subItem.isModal ? (
            <SidebarMenuSubButton className="cursor-pointer" onClick={handleClick}>
              {subItem.name}
            </SidebarMenuSubButton>
          ) : (
            <SidebarMenuSubButton
              isActive={subItem.isActive}
              render={
                <Link to={subItem.url} onClick={handleCloseSidebar}>
                  <span>{subItem.name}</span>
                </Link>
              }></SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      ))}
    </>
  );
}

function NavCollapsibleItem({
  item,
  handleCloseSidebar,
}: {
  item: SidebarNavItem;
  handleCloseSidebar: () => void;
}) {
  const sidebarAddCollapsed = useSettingsStore((state) => state.sidebarAddCollapsed);
  const isAdd = item.name === "Add";
  const [isOpen, setIsOpen] = useState(isAdd ? sidebarAddCollapsed : item.isActive);

  useEffect(() => {
    if (isAdd) {
      setIsOpen(sidebarAddCollapsed);
    }
  }, [sidebarAddCollapsed, isAdd]);

  const hasItems = !!item.items?.length;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      render={
        <SidebarMenuItem>
          <CollapsibleTrigger
            disabled={!hasItems}
            nativeButton={false}
            render={
              <SidebarMenuAction
                className="group relative top-0 right-0 flex aspect-auto h-8 w-full items-center justify-between gap-2 p-2 text-sm [&_svg]:size-4 [&_svg]:shrink-0"
                render={
                  <div>
                    <span className="flex items-center gap-2 text-sm">
                      <item.icon />
                      <span>{item.name}</span>
                    </span>
                    {hasItems && (
                      <ChevronRightIcon
                        aria-label="toggle"
                        className="transition-transform group-data-panel-open:rotate-90"
                      />
                    )}
                  </div>
                }></SidebarMenuAction>
            }></CollapsibleTrigger>

          {hasItems && (
            <CollapsibleContent className="py-2">
              <SidebarMenuSub className="scrollbar max-h-48 overflow-y-auto">
                <SubNavItems items={item.items} handleCloseSidebar={handleCloseSidebar} />
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </SidebarMenuItem>
      }></Collapsible>
  );
}
