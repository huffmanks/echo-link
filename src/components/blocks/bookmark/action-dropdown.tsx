import { Link } from "@tanstack/react-router";
import { EllipsisVerticalIcon } from "lucide-react";

import {
  useDeleteBookmark,
  useToggleArchiveBookmark,
  useToggleReadBookmark,
  useToggleShareBookmark,
} from "@/lib/mutations";
import { cn } from "@/lib/utils";
import { useBulkSelection } from "@/providers/bulk-selection";
import type { Bookmark } from "@/types";

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
  bookmark: Bookmark;
  handleOpenSheet: (bookmark: Bookmark) => void;
  handleOpenChange: (open: boolean) => void;
  triggerButtonClassName?: string;
}

export default function ActionDropdown({
  bookmark,
  handleOpenSheet,
  handleOpenChange,
  triggerButtonClassName,
}: ActionDropdownProps) {
  const { isBulkSelecting } = useBulkSelection();

  const { mutate: toggleReadBookmark } = useToggleReadBookmark();
  const { mutate: toggleArchiveBookmark } = useToggleArchiveBookmark();
  const { mutate: toggleShareBookmark } = useToggleShareBookmark();

  const { mutate: deleteBookmark } = useDeleteBookmark();

  async function handleDelete() {
    deleteBookmark(bookmark.id);
    handleOpenChange(false);
  }
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              tabIndex={isBulkSelecting ? -1 : 0}
              disabled={isBulkSelecting}
              variant="ghost"
              size="icon-sm"
              className={cn(
                "cursor-pointer",
                triggerButtonClassName,
                isBulkSelecting && "pointer-events-none"
              )}>
              <EllipsisVerticalIcon className="text-muted-foreground size-4" />
            </Button>
          }></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{bookmark.title}</DropdownMenuLabel>
            <DropdownMenuItem className="cursor-pointer" onClick={() => handleOpenSheet(bookmark)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              nativeButton={false}
              render={
                <Link to="/dashboard/bookmarks/$id/edit" params={{ id: String(bookmark.id) }}>
                  Edit
                </Link>
              }
            />
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toggleReadBookmark({ id: bookmark.id, unread: !bookmark.unread })}>
              <span>Mark as {bookmark.unread ? "read" : "unread"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() =>
                toggleArchiveBookmark({ id: bookmark.id, is_archived: !bookmark.is_archived })
              }>
              <span>{bookmark.is_archived ? "Unarchive" : "Archive"}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => toggleShareBookmark({ id: bookmark.id, shared: !bookmark.shared })}>
              <span>{bookmark.shared ? "Unshare" : "Share"}</span>
            </DropdownMenuItem>
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
            This action cannot be undone. This will permanently delete this bookmark.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
