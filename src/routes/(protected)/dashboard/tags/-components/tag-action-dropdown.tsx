import { Link } from "@tanstack/react-router";
import { EllipsisVerticalIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store";
import { joinUrlPath } from "@/lib/utils";
import type { Tag } from "@/types";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionDropdownProps {
  tag: Tag;
}

export default function TagActionDropdown({ tag }: ActionDropdownProps) {
  const { linkdingUrl, limit } = useSettingsStore(
    useShallow((state) => ({
      linkdingUrl: state.linkdingUrl,
      limit: state.limit,
    }))
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="cursor-pointer">
            <EllipsisVerticalIcon className="size-4" />
          </Button>
        }></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{tag.name}</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            nativeButton={false}
            render={
              <Link to="/dashboard/tags/$tagName" params={{ tagName: tag.name }} search={{ limit }}>
                View
              </Link>
            }
          />
          <DropdownMenuItem
            className="cursor-pointer"
            nativeButton={false}
            render={
              <a
                href={joinUrlPath(linkdingUrl, "/admin/bookmarks/tag/")}
                target="_blank"
                rel="noopener noreferrer">
                Edit
              </a>
            }
          />
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
