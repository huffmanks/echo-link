import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";

import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { DRAWER_MOBILE_NAV } from "@/lib/constants";
import { getAllQueryOptions } from "@/lib/queries";
import { checkActive, cn } from "@/lib/utils";
import { useGlobalModal } from "@/providers/global-modal-context";
import type { Folder, SidebarNavItem, Tag } from "@/types";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function AppMobileNav() {
  const { pathname } = useLocation();

  const { activeGlobalDrawer, setActiveGlobalDrawer, closeGlobalDrawer } = useGlobalModal();
  const isKeyboardVisible = useKeyboardVisible();
  const isBulkSelecting = useBulkSelectionStore((state) => state.isBulkSelecting);

  const { data: folders } = useSuspenseQuery(getAllQueryOptions.folders);
  const { data: tags } = useSuspenseQuery(getAllQueryOptions.tags);

  const items = useMemo(() => {
    return DRAWER_MOBILE_NAV.map((item) => {
      const newItem = { ...item };

      let subItems: Array<SubItem> | undefined = undefined;
      if (newItem.name === "Folders" && folders?.results) {
        subItems = folders.results
          .map((f) => ({
            ...f,
            entityType: "folders" as const,
            params: { id: String(f.id) } as const,
          }))
          .sort((a, b) => {
            const orderA = a.order ?? Infinity;
            const orderB = b.order ?? Infinity;
            return orderA - orderB;
          });
      } else if (newItem.name === "Tags" && tags?.results) {
        subItems = tags.results
          .map((t) => ({
            ...t,
            entityType: "tags" as const,
            params: { tagName: String(t.name) } as const,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }

      return {
        ...newItem,
        isActive: checkActive({ pathname, url: newItem.url, name: newItem.name }),
        subItems,
      };
    });
  }, [pathname, folders, tags]);

  return (
    <nav
      className={cn(
        "bg-background/60 fixed right-0 bottom-0 left-0 z-50 h-26 rounded-b-xl border-t pb-10 backdrop-blur-md transition-transform duration-300",
        isKeyboardVisible || !!activeGlobalDrawer || isBulkSelecting
          ? "translate-y-full opacity-0"
          : "translate-y-0 opacity-100"
      )}>
      <div className="h-18 px-3 pt-4">
        <div className="flex w-full items-center gap-4">
          {items.map((item) => {
            if (item?.subItems?.length || item.name === "Add") {
              return (
                <NavDrawer
                  key={item.name}
                  item={item}
                  isOpen={activeGlobalDrawer === item.name}
                  onOpenChange={(open) => setActiveGlobalDrawer(open ? item.name : null)}
                />
              );
            }

            return (
              <Button
                key={item.url}
                variant="ghost-no-events"
                size="icon-nav"
                nativeButton={false}
                render={
                  <Link to={item.url} className="flex flex-col gap-1!" onClick={closeGlobalDrawer}>
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-full p-1.5 transition-colors",
                        item.isActive && "bg-muted text-primary dark:bg-muted/50"
                      )}>
                      <item.icon className="size-6" />
                    </div>
                    <p
                      className={cn(
                        "text-muted-foreground text-xs font-normal transition-colors",
                        item.isActive && "text-foreground font-medium"
                      )}>
                      {item.name}
                    </p>
                  </Link>
                }></Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

type ExtendedSidebarNavItem = SidebarNavItem & {
  subItems?: Array<SubItem>;
};

type SubItem = (Folder | Tag) & {
  entityType: "folders" | "tags";
  params: {
    id?: string;
    tagName?: string;
  };
};

function NavDrawer({
  item,
  isOpen,
  onOpenChange,
}: {
  item: ExtendedSidebarNavItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [pendingModal, setPendingModal] = useState(false);

  const { setActiveGlobalDialog, closeGlobalDrawer } = useGlobalModal();

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerTrigger
        render={
          <Button
            variant="ghost-no-events"
            size="icon-nav"
            className="flex cursor-pointer flex-col gap-1!">
            <div
              className={cn(
                "flex items-center justify-center rounded-full p-2 transition-colors",
                item.isActive && "bg-muted text-primary dark:bg-muted/50",
                item.name === "Add" && "bg-foreground text-background",
                item.isActive && item.name === "Add" && "text-primary"
              )}>
              <item.icon className="size-6" />
            </div>
            <p
              className={cn(
                "text-muted-foreground text-xs font-normal transition-colors",
                item.isActive && "text-foreground font-medium"
              )}>
              {item.name}
            </p>
          </Button>
        }></DrawerTrigger>
      <DrawerPopup
        className={cn(
          "flex max-h-dvh flex-col px-0 shadow-[0_2px_50px_rgb(0_0_0/0.15)] dark:shadow-[0_2px_200px_rgb(0_0_0/0.9)]",
          "pb-[max(0px,calc(var(--drawer-snap-point-offset)+var(--drawer-swipe-movement-y)+var(--bleed)))]!"
        )}>
        <div className="border-b px-4 pb-4">
          <DrawerTitle className="mx-auto max-w-lg px-4">
            {item.name === "Add" ? (
              <span>{item.name}</span>
            ) : (
              <Button
                className="h-10 w-full cursor-pointer rounded-xl"
                variant="outline"
                nativeButton={false}
                onClick={closeGlobalDrawer}
                render={<Link to={item.url}>{item.name}</Link>}
              />
            )}
          </DrawerTitle>
          <DrawerDescription className="sr-only">List of options to choose from.</DrawerDescription>
        </div>
        <DrawerContent
          className={cn(
            "w-full flex-1 overflow-y-auto overscroll-contain px-4 pt-4",
            "pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
            pendingModal ? "duration-250!" : "duration-300"
          )}>
          <div className="mx-auto mb-4 max-w-lg">
            {!item.subItems?.length ? (
              <div className="flex flex-col gap-3 p-4">
                <DrawerButtonLink name="Bookmark" link="/dashboard/add/bookmark" />
                <DrawerButtonLink name="Folder" link="/dashboard/add/folder" />
                <Button
                  className="bg-muted/80 border-muted h-12 cursor-pointer rounded-xl border"
                  variant="secondary"
                  onClick={() => {
                    setPendingModal(true);
                    closeGlobalDrawer();
                    setTimeout(() => {
                      setActiveGlobalDialog("tag-form");
                      setPendingModal(false);
                    }, 300);
                  }}>
                  Tag
                </Button>
              </div>
            ) : (
              <div className="scrollbar overflow-y-auto p-4">
                <div className="flex flex-col gap-2">
                  {item.subItems.map((subItem) => (
                    <DrawerButtonLink
                      key={subItem.id}
                      name={subItem.name}
                      params={subItem.params}
                      link={`/dashboard/${subItem.entityType}/${subItem.entityType === "tags" ? subItem.params.tagName : subItem.params.id}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mx-auto mb-4 max-w-lg px-4">
            <DrawerClose
              className={cn(
                "w-full cursor-pointer rounded-xl!",
                buttonVariants({ variant: "default", size: "default" })
              )}>
              Close
            </DrawerClose>
          </div>
        </DrawerContent>
      </DrawerPopup>
    </Drawer>
  );
}

function DrawerButtonLink({
  name,
  link,
  params,
}: {
  name: string;
  link: string;
  params?: { id?: string; tagName?: string };
}) {
  const { closeGlobalDrawer } = useGlobalModal();
  return (
    <Button
      className="bg-muted/80 border-muted h-12 cursor-pointer rounded-xl border"
      variant="secondary"
      nativeButton={false}
      onClick={closeGlobalDrawer}
      render={
        <Link to={link} params={params}>
          {name}
        </Link>
      }
    />
  );
}
