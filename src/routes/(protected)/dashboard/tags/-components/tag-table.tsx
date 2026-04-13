import { useSuspenseQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { getAllQueryOptions } from "@/lib/queries";
import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { cn, formatToLocalTime } from "@/lib/utils";
import TagActionDropdown from "@/routes/(protected)/dashboard/tags/-components/tag-action-dropdown";
import TagCell from "@/routes/(protected)/dashboard/tags/-components/tag-cell";
import type { PaginatedResponse, Tag } from "@/types";

import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TagTable({ initialTags }: { initialTags: PaginatedResponse<Tag> }) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      selectedIds: state.selectedIds,
      toggleIdSelection: state.toggleIdSelection,
    }))
  );

  const items = initialTags.results
    .filter((f) => !f.id.toString().startsWith("temp"))
    .sort((a, b) => a.name.localeCompare(b.name));

  const allTagIds = items.map((tag) => tag.id);

  return (
    <>
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className={cn("transition-all", isBulkSelecting ? "w-8.5 p-2" : "w-0 p-0")}>
              <AllCheckbox allIds={allTagIds} />
            </TableHead>
            <TableHead className="w-10">Id</TableHead>
            <TableHead className="w-64">Name</TableHead>
            <TableHead className="w-48">Date added</TableHead>
            <TableHead className="w-24">Bookmarks</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="[&_tr:last-child]:border-0">
          {items.map((tag) => (
            <TableRow
              key={tag.id}
              tabIndex={isBulkSelecting ? -1 : 0}
              role="button"
              className={cn(
                "border-muted relative transition-all outline-none",

                isBulkSelecting
                  ? "hover:ring-primary/50 cursor-pointer hover:ring-2"
                  : "hover:bg-muted/50 focus:bg-muted"
              )}
              onClick={() => {
                if (isBulkSelecting) {
                  toggleIdSelection(tag.id);
                }
              }}>
              <TableCell>
                <ItemCheckbox id={tag.id} />
              </TableCell>
              <TableCell>{tag.id}</TableCell>
              <TableCell>
                <TagCell tag={tag} />
              </TableCell>
              <TableCell>{formatToLocalTime(tag.date_added)}</TableCell>
              <TableCell>
                <BookmarksCount tagName={tag.name} />
              </TableCell>

              <TableCell className="flex items-center justify-end">
                <TagActionDropdown tag={tag} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-muted-foreground px-2 py-2.5">
              {isBulkSelecting ? `Selected: ${selectedIds.size}` : `Total: ${items.length}`}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}

function BookmarksCount({ tagName }: { tagName: string }) {
  const { data: tags } = useSuspenseQuery(getAllQueryOptions.bookmarksByTagName(tagName));

  return <span>{tags.count}</span>;
}
