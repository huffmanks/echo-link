import { getDomain } from "tldts";
import { useShallow } from "zustand/react/shallow";

import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { useSettingsStore } from "@/lib/store/settings";
import { cn, formatToLocalTime } from "@/lib/utils";
import type { Bookmark } from "@/types";

import ActionDropdown from "@/components/blocks/bookmark/action-dropdown";
import BookmarkFavicon from "@/components/blocks/bookmark/bookmark-favicon";
import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import TagCell from "@/components/blocks/bookmark/tag-cell";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BookmarkTableViewProps {
  bookmarks: Array<Bookmark>;
  paginationLabel: string;
  handleOpenSheet: (bookmark: Bookmark) => void;
  handleOpenChange: (open: boolean) => void;
}

export default function BookmarkTableView({
  bookmarks,
  paginationLabel,
  handleOpenSheet,
  handleOpenChange,
}: BookmarkTableViewProps) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      selectedIds: state.selectedIds,
      toggleIdSelection: state.toggleIdSelection,
    }))
  );

  const { defaultSortDate, showIdColumn } = useSettingsStore(
    useShallow((state) => ({
      defaultSortDate: state.defaultSortDate,
      showIdColumn: state.showIdColumn,
    }))
  );

  const allBookmarkIds = bookmarks.map((bookmark) => bookmark.id);

  return (
    <div className="pb-6 sm:px-2">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className={cn("transition-all", isBulkSelecting ? "w-8.5 p-2" : "w-0 p-0")}>
              <AllCheckbox allIds={allBookmarkIds} />
            </TableHead>
            {showIdColumn && <TableHead className="w-10">Id</TableHead>}
            <TableHead className="w-8.5"></TableHead>
            <TableHead className="w-64">Title</TableHead>
            <TableHead className="w-64">Link</TableHead>
            <TableHead className="w-64">Tags</TableHead>
            <TableHead className="w-48">
              {defaultSortDate === "date_added" ? "Created" : "Updated"}
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookmarks.map((bookmark) => (
            <TableRow
              key={bookmark.id}
              tabIndex={isBulkSelecting ? -1 : 0}
              role="button"
              className={cn(
                "border-muted relative transition-all outline-none",
                bookmark.unread && "bg-primary/10",
                isBulkSelecting
                  ? "hover:ring-primary/50 cursor-pointer hover:ring-2"
                  : "hover:bg-muted/50 focus:bg-muted"
              )}
              onClick={() => {
                if (isBulkSelecting) {
                  toggleIdSelection(bookmark.id);
                }
              }}
              onKeyDown={(e) => {
                if (isBulkSelecting) return;

                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenSheet(bookmark);
                }
              }}>
              <TableCell>
                <ItemCheckbox id={bookmark.id} />
              </TableCell>
              {showIdColumn && <TableCell>{bookmark.id}</TableCell>}
              <TableCell
                role="button"
                className="cursor-pointer"
                onClick={() => {
                  if (!isBulkSelecting) {
                    handleOpenSheet(bookmark);
                  }
                }}>
                <BookmarkFavicon bookmark={bookmark} />
              </TableCell>
              <TableCell
                role="button"
                className="cursor-pointer truncate"
                onClick={() => {
                  if (!isBulkSelecting) {
                    handleOpenSheet(bookmark);
                  }
                }}>
                {bookmark.title}
              </TableCell>
              <TableCell className="truncate">
                <a
                  className={cn(
                    "underline-offset-2 transition-all outline-none hover:underline focus-visible:underline",
                    isBulkSelecting
                      ? "text-foreground pointer-events-none"
                      : "text-primary focus-visible:text-primary/80"
                  )}
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={isBulkSelecting ? -1 : 0}>
                  {getDomain(bookmark.url)}
                </a>
              </TableCell>
              <TableCell className="min-w-0">
                <TagCell tags={bookmark.tag_names} handleOpenChange={handleOpenChange} />
              </TableCell>
              <TableCell
                role="button"
                className="cursor-pointer truncate"
                onClick={() => {
                  if (!isBulkSelecting) {
                    handleOpenSheet(bookmark);
                  }
                }}>
                <span>
                  {defaultSortDate === "date_added"
                    ? formatToLocalTime(bookmark.date_added)
                    : formatToLocalTime(bookmark.date_modified)}
                </span>
              </TableCell>
              <TableCell className="flex items-center justify-end">
                <ActionDropdown
                  bookmark={bookmark}
                  handleOpenSheet={handleOpenSheet}
                  handleOpenChange={handleOpenChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={showIdColumn ? 8 : 7} className="text-muted-foreground px-2 py-2.5">
              {isBulkSelecting ? `Selected: ${selectedIds.size}` : paginationLabel}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
