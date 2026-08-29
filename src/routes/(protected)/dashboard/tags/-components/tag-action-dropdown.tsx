import { Link } from "@tanstack/react-router";
import { EllipsisVerticalIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDeleteTag } from "@/lib/mutations";
import { useSettingsStore } from "@/lib/store/settings";
import { joinUrlPath } from "@/lib/utils";
import type { Tag } from "@/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  const { mutate: deleteTag } = useDeleteTag();

  return (
    <AlertDialog>
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
                <Link
                  to="/dashboard/tags/$tagName"
                  params={{ tagName: tag.name }}
                  search={{ limit }}>
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

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem className="w-full cursor-pointer" variant="destructive">
              <AlertDialogTrigger
                className="w-full"
                nativeButton={false}
                render={<span>Delete</span>}></AlertDialogTrigger>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this tag.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            onClick={() => deleteTag(tag.id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
