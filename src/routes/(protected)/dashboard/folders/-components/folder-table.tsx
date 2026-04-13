import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { GripVerticalIcon } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useShallow } from "zustand/react/shallow";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useEditFolder } from "@/lib/mutations";
import { getAllQueryOptions } from "@/lib/queries";
import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { cn, formatToLocalTime } from "@/lib/utils";
import FolderActionDropdown from "@/routes/(protected)/dashboard/folders/-components/folder-action-dropdown";
import FolderCell from "@/routes/(protected)/dashboard/folders/-components/folder-cell";
import type { Folder, PaginatedResponse } from "@/types";

import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import { Button } from "@/components/ui/button";
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

  const { isBulkSelecting, selectedIds } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      selectedIds: state.selectedIds,
    }))
  );

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
            <TableHead className={cn("transition-all", isBulkSelecting ? "w-8.5" : "w-12")}>
              <AllCheckbox allIds={allFolderIds} />
            </TableHead>
            <TableHead className="w-10">Id</TableHead>
            <TableHead className="w-64">Name</TableHead>
            <TableHead className="w-48">Date added</TableHead>
            <TableHead className="w-14">Order</TableHead>
            <TableHead className="w-24">Bookmarks</TableHead>
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
            <TableCell colSpan={7} className="text-muted-foreground px-2 py-2.5">
              {isBulkSelecting ? `Selected: ${selectedIds.size}` : `Total: ${items.length}`}
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
  const { isBulkSelecting, toggleIdSelection } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      toggleIdSelection: state.toggleIdSelection,
    }))
  );

  return (
    <Reorder.Item
      key={folder.id}
      value={folder}
      as="tr"
      dragListener={false}
      dragControls={controls}
      onDragStart={() => onDragStart({ id: folder.id })}
      onDragEnd={onDragEnd}
      onClick={() => {
        if (isBulkSelecting) {
          toggleIdSelection(folder.id);
        }
      }}
      className={cn(
        "border-muted relative border-b transition-colors outline-none",
        isBulkSelecting
          ? "hover:ring-primary/50 cursor-pointer hover:ring-2"
          : "hover:bg-muted/50 focus:bg-muted",
        activeId === folder.id && "bg-accent/50 z-50 shadow-lg",
        activeId !== null && activeId !== folder.id && "hover:bg-transparent",
        activeId === null && "data-[state=selected]:bg-muted"
      )}
      data-dragging={undefined}>
      <TableCell>
        {isBulkSelecting ? (
          <ItemCheckbox id={folder.id} />
        ) : (
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-grab touch-none active:cursor-grabbing"
            onPointerDown={(e) => controls.start(e)}>
            <GripVerticalIcon className="text-muted-foreground size-4" />
          </Button>
        )}
      </TableCell>
      <TableCell>{folder.id}</TableCell>

      <TableCell className="truncate">
        <FolderCell folder={folder} />
      </TableCell>

      <TableCell>{formatToLocalTime(folder.date_created)}</TableCell>

      <TableCell>{index}</TableCell>
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
