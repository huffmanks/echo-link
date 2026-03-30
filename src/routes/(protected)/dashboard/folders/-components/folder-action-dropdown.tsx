import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { EllipsisVerticalIcon } from "lucide-react";

import { useDeleteFolder } from "@/lib/mutations";
import { useSettingsStore } from "@/lib/store";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionDropdownProps {
  id: number;
  name: string;
}

export default function FolderActionDropdown({ id, name }: ActionDropdownProps) {
  const { mutate } = useDeleteFolder();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const limit = useSettingsStore((state) => state.limit);

  function handleEdit() {
    navigate({ to: "/dashboard/folders/$id/edit", params: { id: String(id) } });
  }

  function handleDelete() {
    mutate(id);

    navigate({ to: "/dashboard", search: { limit } });
  }

  const isFoldersPath = pathname === "/dashboard/folders";

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
            <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
            {isFoldersPath && (
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleEdit}
                render={
                  <Link to="/dashboard/folders/$id" params={{ id: String(id) }} search={{ limit }}>
                    View
                  </Link>
                }></DropdownMenuItem>
            )}
            <DropdownMenuItem className="cursor-pointer" onClick={handleEdit}>
              Edit
            </DropdownMenuItem>
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
            This action cannot be undone. This will permanently delete this folder.
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
