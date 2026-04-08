import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { GripVerticalIcon } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useEditFolder } from "@/lib/mutations";
import { getAllQueryOptions } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { useBulkSelection } from "@/providers/bulk-selection";
import FolderActionDropdown from "@/routes/(protected)/dashboard/folders/-components/folder-action-dropdown";
import type { Folder, PaginatedResponse } from "@/types";

import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import {
  Table,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FolderTable({
  initialFolders,
}: {
  initialFolders: PaginatedResponse<Folder>;
}) {
  const [items, setItems] = useState<Array<Folder>>(() =>
    initialFolders.results
      .filter((f) => !f.id.toString().startsWith("temp"))
      .sort((a, b) => a.order - b.order)
  );
  const [activeId, setActiveId] = useState<number | null>(null);

  const { mutate: editFolder } = useEditFolder();

  const debouncedSave = useDebouncedCallback((newOrder: Folder[]) => {
    newOrder.forEach((item, index) => {
      if (item.order !== index) {
        editFolder({ ...item, id: item.id, order: index });
      }
    });
  }, 500);

  function handleReorder(newOrder: Folder[]) {
    setItems(newOrder);
  }

  function onDragStart({ id }: { id: number }) {
    setActiveId(id);
  }

  function onDragEnd() {
    setActiveId(null);
    debouncedSave(items);
  }

  const allFolderIds = items.map((folder) => folder.id);

  return (
    <>
      <Table className={cn("w-full table-fixed", activeId !== null && "select-none")}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-9 p-0">
              <div className="flex h-full w-full items-center justify-center">
                <AllCheckbox allIds={allFolderIds} />
              </div>
            </TableHead>
            <TableHead className="w-10">Id</TableHead>
            <TableHead className="w-14">Order</TableHead>
            <TableHead className="min-36 w-3/4 truncate">Name</TableHead>
            <TableHead className="min-24 w-1/4">Bookmarks</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>

        <Reorder.Group
          as="tbody"
          axis="y"
          values={items}
          onReorder={handleReorder}
          className="[&_tr:last-child]:border-0">
          {items.map((folder, index) => (
            <FolderRow
              key={folder.id}
              index={index}
              folder={folder}
              activeId={activeId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          ))}
        </Reorder.Group>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-muted-foreground px-2 py-2.5">
              Total: {items.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}

interface FolderRowProps {
  folder: Folder;
  index: number;
  activeId: number | null;
  onDragStart: ({ id }: { id: number }) => void;
  onDragEnd: () => void;
}

function FolderRow({ folder, index, activeId, onDragStart, onDragEnd }: FolderRowProps) {
  const controls = useDragControls();
  const { isBulkSelecting } = useBulkSelection();

  return (
    <Reorder.Item
      key={folder.id}
      value={folder}
      as="tr"
      dragListener={false}
      dragControls={controls}
      onDragStart={() => onDragStart({ id: folder.id })}
      onDragEnd={onDragEnd}
      className={cn(
        "relative border-b transition-colors",
        activeId === folder.id ? "bg-accent/50 z-50 shadow-lg" : "hover:bg-muted/50 z-0",
        activeId !== null && activeId !== folder.id && "hover:bg-transparent"
      )}
      data-dragging={undefined}>
      <TableCell className="w-9 p-0">
        <div className="flex w-9 items-center justify-center">
          {isBulkSelecting ? (
            <ItemCheckbox id={folder.id} />
          ) : (
            <div
              className="flex cursor-grab touch-none items-center justify-center p-2 active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}>
              <GripVerticalIcon className="text-muted-foreground size-5" />
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{folder.id}</TableCell>
      <TableCell>{index}</TableCell>
      <TableCell>{folder.name}</TableCell>
      <TableCell>
        <BookmarksCount id={folder.id} />
      </TableCell>
      <TableCell className="flex items-center justify-end">
        <FolderActionDropdown id={folder.id} name={folder.name} />
      </TableCell>
    </Reorder.Item>
  );
}

function BookmarksCount({ id }: { id: number }) {
  const { data: bookmarks } = useSuspenseQuery(getAllQueryOptions.bookmarksByFolderId(String(id)));

  return <span>{bookmarks.count}</span>;
}
