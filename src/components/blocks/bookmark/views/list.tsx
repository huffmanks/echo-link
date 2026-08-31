import { CalendarClockIcon, CalendarPlusIcon } from "lucide-react";
import { getDomain } from "tldts";
import { useShallow } from "zustand/react/shallow";

import { useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { cn, getRelativeTimeString } from "@/lib/utils";
import type { Bookmark } from "@/types";

import ActionDropdown from "@/components/blocks/bookmark/action-dropdown";
import BookmarkFavicon from "@/components/blocks/bookmark/bookmark-favicon";
import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import SharedButton from "@/components/blocks/bookmark/shared-button";
import TagCell from "@/components/blocks/bookmark/tag-cell";
import { Badge } from "@/components/ui/badge";

interface BookmarkListViewProps {
  bookmarks: Array<Bookmark>;
  paginationLabel: string;
  handleOpenSheet: (bookmark: Bookmark) => void;
  handleOpenChange: (open: boolean) => void;
}

export default function BookmarkListView({
  bookmarks,
  paginationLabel,
  handleOpenSheet,
  handleOpenChange,
}: BookmarkListViewProps) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      selectedIds: state.selectedIds,
      toggleIdSelection: state.toggleIdSelection,
    }))
  );

  const allBookmarkIds = bookmarks.map((bookmark) => bookmark.id);

  return (
    <div className="max-w-3xl space-y-2 pb-10">
      <div className="mb-4 flex items-center gap-2">
        <div
          className={cn(
            "overflow-hidden transition-[width] [interpolate-size:allow-keywords]",
            isBulkSelecting ? "w-auto" : "w-0"
          )}>
          <AllCheckbox allIds={allBookmarkIds} showLabel />
        </div>

        <p className="text-muted-foreground pl-2 text-sm">
          {isBulkSelecting ? `${selectedIds.size} selected` : paginationLabel}
        </p>
      </div>
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="flex gap-2 pr-2">
          <div
            className={cn(
              "mt-4 shrink-0 overflow-hidden transition-[width] [interpolate-size:allow-keywords]",
              isBulkSelecting ? "w-auto" : "w-0"
            )}>
            <ItemCheckbox id={bookmark.id} />
          </div>

          <div
            className={cn(
              "relative block w-full min-w-0 flex-1 rounded-md p-2 text-left transition-colors",
              selectedIds.has(bookmark.id)
                ? "bg-primary/15 hover:bg-primary/20"
                : !isBulkSelecting && bookmark.unread && "bg-primary/10",
              isBulkSelecting && "hover:ring-primary/50 cursor-pointer hover:ring-2"
            )}
            onClick={() => {
              if (isBulkSelecting) {
                toggleIdSelection(bookmark.id);
              }
            }}>
            {!isBulkSelecting && bookmark.unread && (
              <div className="bg-primary absolute top-1/2 right-5 size-2 -translate-y-1/2 rounded-full" />
            )}
            <section className="-mb-1 flex min-w-0 items-center justify-between gap-2">
              <div
                role="button"
                className={cn(
                  "flex min-w-0 items-center gap-2",
                  isBulkSelecting ? "pointer-events-none" : "cursor-pointer"
                )}
                tabIndex={isBulkSelecting ? -1 : 0}
                onClick={() => {
                  if (!isBulkSelecting) {
                    handleOpenSheet(bookmark);
                  }
                }}>
                <BookmarkFavicon bookmark={bookmark} />
                <h2 className="truncate text-sm font-medium">{bookmark.title}</h2>
              </div>
              <ActionDropdown
                bookmark={bookmark}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            </section>
            <section className="mb-1 flex">
              <p>
                <a
                  className={cn(
                    "truncate text-xs underline underline-offset-2 transition-colors outline-none",
                    isBulkSelecting
                      ? "text-foreground pointer-events-none"
                      : "decoration-primary text-foreground hover:decoration-primary/70 focus-visible:decoration-primary/70 hover:text-primary/70 focus-visible:text-primary/70"
                  )}
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={isBulkSelecting ? -1 : 0}>
                  {getDomain(bookmark.url)}
                </a>
              </p>
            </section>

            <section className="mb-2 space-y-2 pr-8">
              {bookmark?.description && (
                <p
                  className={cn(
                    "line-clamp-2 text-xs",
                    !isBulkSelecting && bookmark.unread
                      ? "text-foreground/80"
                      : "text-muted-foreground"
                  )}>
                  {bookmark.description}
                </p>
              )}
              <div className="justify-content flex items-center gap-3">
                {bookmark?.date_added && (
                  <div
                    className={cn(
                      "justify-content flex items-center gap-1",
                      !bookmark?.description && "mt-2"
                    )}>
                    <CalendarPlusIcon className="text-muted-foreground size-3" />
                    <span className="text-xs">
                      {getRelativeTimeString(new Date(bookmark.date_added))}
                    </span>
                  </div>
                )}
                {bookmark?.date_modified && (
                  <div
                    className={cn(
                      "justify-content flex items-center gap-1",
                      !bookmark?.description && "mt-2"
                    )}>
                    <CalendarClockIcon className="text-muted-foreground size-3" />
                    <span className="text-xs">
                      {getRelativeTimeString(new Date(bookmark.date_modified))}
                    </span>
                  </div>
                )}
              </div>
            </section>
            <section className="mb-2 flex items-center gap-1">
              <SharedButton
                title={bookmark.title}
                text={bookmark.description}
                url={bookmark.url}
                isShared={bookmark.shared}
              />

              {bookmark.is_archived && <Badge variant="warning">Archived</Badge>}

              <TagCell tags={bookmark.tag_names} handleOpenChange={handleOpenChange} />
            </section>
          </div>
        </div>
      ))}
    </div>
  );
}
