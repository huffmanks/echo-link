import { useMemo } from "react";

import { Link, useNavigate } from "@tanstack/react-router";
import { ExternalLinkIcon, LogOutIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { logout } from "@/lib/auth";
import { SIDEBAR_NAV_SECONDARY } from "@/lib/constants";
import { useSettingsStore } from "@/lib/store";
import { joinUrlPath } from "@/lib/utils";

import { OnlineStatus } from "@/components/online-status";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavUser() {
  const navigate = useNavigate();

  const { linkdingUrl, username } = useSettingsStore(
    useShallow((state) => ({
      linkdingUrl: state.linkdingUrl,
      username: state.username,
    }))
  );
  const initial = username ? username.charAt(0).toUpperCase() : "E";

  const items = useMemo(() => {
    return SIDEBAR_NAV_SECONDARY.map((item) => {
      const newItem = { ...item };

      if (!linkdingUrl) return newItem;

      if (newItem.isExternal) {
        newItem.url = joinUrlPath(linkdingUrl, newItem.url || null);
      }

      return newItem;
    });
  }, [linkdingUrl]);

  function handleLogout() {
    logout();

    navigate({ to: "/", replace: true });
  }

  return (
    <div className="w-auto">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="cursor-pointer"
          render={
            <Button variant="ghost" size="default" className="w-auto rounded-full p-0">
              <div className="relative">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-background">{initial}</AvatarFallback>
                </Avatar>
                <OnlineStatus />
              </div>
            </Button>
          }></DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          side="top"
          align="end"
          sideOffset={-35}>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8">
                  <AvatarFallback>{initial}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{username}</span>
                </div>
                <OnlineStatus justIndicator={false} />
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {items.slice(0, 1).map((item) => (
              <DropdownMenuItem
                key={item.url}
                className="cursor-pointer"
                nativeButton={false}
                render={
                  <Link
                    to={item.url}
                    target={item.isExternal ? "_blank" : "_self"}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                }></DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal tracking-wide uppercase">
              Linkding
            </DropdownMenuLabel>
            {items.slice(1).map((item) => (
              <DropdownMenuItem
                key={item.url}
                className="cursor-pointer"
                nativeButton={false}
                render={
                  <Link
                    className="justify-between"
                    to={item.url}
                    target={item.isExternal ? "_blank" : "_self"}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}>
                    <div className="flex items-center gap-2">
                      <item.icon />
                      <span>{item.name}</span>
                    </div>
                    {item.isExternal && <ExternalLinkIcon />}
                  </Link>
                }></DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            <LogOutIcon />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
