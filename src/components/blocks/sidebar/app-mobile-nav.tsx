import { useMemo, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";

import { useKeyboardVisible } from "@/hooks/use-keyboard-visible";
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export default function AppMobileNav() {
  const { pathname } = useLocation();

  const isKeyboardVisible = useKeyboardVisible();

  const { data: folders } = useSuspenseQuery(getAllQueryOptions.folders);
  const { data: tags } = useSuspenseQuery(getAllQueryOptions.tags);

  const items = useMemo(() => {
    return DRAWER_MOBILE_NAV.map((item) => {
      const newItem = { ...item };

      let subItems: SubItem[] | undefined = undefined;
      if (newItem.name === "Folders" && folders?.results) {
        subItems = folders.results
          .map((f) => ({
            ...f,
            entityType: "folders" as const,
            params: { id: String(f.id) } as const,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
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
        isKeyboardVisible ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      )}>
      <div className="h-18 px-3 pt-4">
        <div className="flex w-full items-center gap-4">
          {items.map((item) => {
            if (!!item.isCollapsible) {
              return <NavDrawer key={item.name} item={item} />;
            }

            return (
              <Button
                key={item.url}
                variant="ghost-no-events"
                size="icon-nav"
                nativeButton={false}
                render={
                  <Link to={item.url} className="flex flex-col gap-1!">
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
  subItems?: SubItem[];
};

type SubItem = (Folder | Tag) & {
  entityType: "folders" | "tags";
  params: {
    id?: string;
    tagName?: string;
  };
};

function NavDrawer({ item }: { item: ExtendedSidebarNavItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingModal, setPendingModal] = useState(false);

  const { setActiveGlobalModal } = useGlobalModal();

  function closeDrawer() {
    setIsOpen(false);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
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
      </DrawerTrigger>
      <DrawerContent
        className={cn("max-h-[80vh]", pendingModal && "data-vaul-drawer:animation-duration-250!")}>
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription className="sr-only">List of options to choose from.</DrawerDescription>
        </DrawerHeader>

        {!item.subItems?.length ? (
          <div className="flex flex-col gap-3 p-4">
            <DrawerButtonLink
              closeDrawer={closeDrawer}
              name="Bookmark"
              link="/dashboard/add/bookmark"
            />
            <DrawerButtonLink
              closeDrawer={closeDrawer}
              name="Folder"
              link="/dashboard/add/folder"
            />
            <Button
              className="cursor-pointer"
              variant="secondary"
              onClick={() => {
                setPendingModal(true);
                closeDrawer();
                setTimeout(() => {
                  setActiveGlobalModal("tag-form");
                  setPendingModal(false);
                }, 300);
              }}>
              Tag
            </Button>
          </div>
        ) : (
          <div className="scrollbar overflow-y-auto pr-4 pb-4 pl-6">
            <div className="flex flex-col gap-2">
              {item.subItems.map((subItem) => (
                <DrawerButtonLink
                  key={subItem.id}
                  closeDrawer={closeDrawer}
                  name={subItem.name}
                  params={subItem.params}
                  link={`/dashboard/${subItem.entityType}/${subItem.entityType === "tags" ? subItem.params.tagName : subItem.params.id}`}
                />
              ))}
            </div>
          </div>
        )}

        <DrawerFooter className="mb-4">
          <DrawerClose
            className={cn(
              "cursor-pointer",
              buttonVariants({ variant: "default", size: "default" })
            )}>
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function DrawerButtonLink({
  name,
  link,
  params,
  closeDrawer,
}: {
  name: string;
  link: string;
  params?: { id?: string; tagName?: string };
  closeDrawer: () => void;
}) {
  return (
    <Button
      className="cursor-pointer"
      variant="secondary"
      nativeButton={false}
      onClick={closeDrawer}
      render={
        <Link to={link} params={params}>
          {name}
        </Link>
      }
    />
  );
}
