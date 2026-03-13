import { Link } from "@tanstack/react-router";

import { cn, getCleanDomain, getRelativeTimeString } from "@/lib/utils";
import { useBulkSelection } from "@/providers/bulk-selection";
import type { Bookmark } from "@/types";

import ActionDropdown from "@/components/blocks/bookmark/action-dropdown";
import BookmarkFavicon from "@/components/blocks/bookmark/bookmark-favicon";
import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import SharedButton from "@/components/blocks/bookmark/shared-button";
import { Badge } from "@/components/ui/badge";

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  count: number;
  handleOpenSheet: (bookmark: Bookmark) => void;
  handleOpenChange: (open: boolean) => void;
}

export default function BookmarkListView({
  bookmarks,
  count,
  handleOpenSheet,
  handleOpenChange,
}: BookmarkListViewProps) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelection();

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
          {isBulkSelecting
            ? `${selectedIds.size} selected`
            : `${count} result${count > 1 ? "s" : ""}`}
        </p>
      </div>
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="flex gap-2 pr-2">
          <div
            className={cn(
              "mt-4 overflow-hidden transition-[width] [interpolate-size:allow-keywords]",
              isBulkSelecting ? "w-auto" : "w-0"
            )}>
            <ItemCheckbox id={bookmark.id} />
          </div>

          <div
            tabIndex={isBulkSelecting ? -1 : 0}
            role="button"
            className={cn(
              "relative block w-full flex-1 rounded-md p-2 text-left transition-colors",
              "has-[[data-sheet-trigger]:focus-visible]:ring-primary/50 has-[[data-sheet-trigger]:hover]:ring-primary/50 has-[[data-sheet-trigger]:focus-visible]:ring-2 has-[[data-sheet-trigger]:focus-visible]:ring-inset has-[[data-sheet-trigger]:hover]:ring-2 has-[[data-sheet-trigger]:hover]:ring-inset has-[[data-tag-links]:focus-visible]:ring-0 has-[[data-tag-links]:hover]:bg-transparent has-[[data-tag-links]:hover]:ring-0",
              bookmark.unread && "bg-primary/15",
              isBulkSelecting && "hover:ring-primary/50 cursor-pointer hover:ring-2"
            )}
            onClick={() => {
              if (isBulkSelecting) {
                toggleIdSelection(bookmark.id);
              }
            }}>
            {bookmark.unread && (
              <div className="bg-primary absolute top-1/2 right-5 size-2 -translate-y-1/2 rounded-full" />
            )}
            <section className="-mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
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
                  {getCleanDomain(bookmark.url)}
                </a>
              </p>
            </section>
            <button
              tabIndex={isBulkSelecting ? -1 : 0}
              data-sheet-trigger
              className={cn(
                "block w-full cursor-pointer text-left outline-none",
                isBulkSelecting && "pointer-events-none select-none"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenSheet(bookmark);
                }
              }}
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName !== "SPAN") {
                  handleOpenSheet(bookmark);
                }
                e.stopPropagation();
              }}>
              <section className="mb-2 space-y-2 pr-8">
                {bookmark?.description && (
                  <p
                    className={cn(
                      "line-clamp-2 text-xs",
                      bookmark.unread ? "text-foreground/80" : "text-muted-foreground"
                    )}>
                    {bookmark.description}
                  </p>
                )}
                {bookmark?.date_added && (
                  <p className={cn("text-xs", !bookmark?.description && "mt-2")}>
                    {getRelativeTimeString(new Date(bookmark.date_added))}
                  </p>
                )}
              </section>
              <section className="mb-2 flex items-center gap-1" data-tag-links>
                <SharedButton
                  title={bookmark.title}
                  text={bookmark.description}
                  url={bookmark.url}
                  isShared={bookmark.shared}
                />

                {bookmark.is_archived && <Badge variant="secondary">Archived</Badge>}

                {bookmark?.tag_names && (
                  <div className="flex items-center gap-1">
                    {bookmark.tag_names.map((tag) => (
                      <Badge
                        key={tag}
                        variant="invert"
                        render={
                          <Link
                            tabIndex={isBulkSelecting ? -1 : 0}
                            className={cn(
                              "transition-colors outline-none",
                              isBulkSelecting && "pointer-events-none"
                            )}
                            to="/dashboard/tags/$tagName"
                            params={{ tagName: tag }}
                            onClick={(e) => e.stopPropagation()}>
                            #{tag}
                          </Link>
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
