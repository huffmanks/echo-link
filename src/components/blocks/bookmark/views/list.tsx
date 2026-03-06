import { Link } from "@tanstack/react-router";

import { cn, getCleanDomain, getRelativeTimeString } from "@/lib/utils";
import type { Bookmark } from "@/types";

import ActionDropdown from "@/components/blocks/bookmark/action-dropdown";
import BookmarkFavicon from "@/components/blocks/bookmark/bookmark-favicon";
import SharedButton from "@/components/blocks/bookmark/shared-button";
import { Badge } from "@/components/ui/badge";

interface BookmarkListViewProps {
  bookmarks: Bookmark[];
  handleOpenSheet: (bookmark: Bookmark) => void;
  handleOpenChange: (open: boolean) => void;
}

export default function BookmarkListView({
  bookmarks,
  handleOpenSheet,
  handleOpenChange,
}: BookmarkListViewProps) {
  return (
    <div className="max-w-3xl space-y-2 pb-10">
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className={cn(
            "relative rounded-md p-2 transition-colors",
            "has-[[data-sheet-trigger]:focus-visible]:bg-card has-[[data-sheet-trigger]:hover]:bg-card has-[[data-sheet-trigger]:focus-visible]:ring-primary/20 has-[[data-sheet-trigger]:hover]:ring-primary/20 has-[[data-sheet-trigger]:focus-visible]:ring-1 has-[[data-sheet-trigger]:focus-visible]:ring-inset has-[[data-sheet-trigger]:hover]:ring-1 has-[[data-sheet-trigger]:hover]:ring-inset has-[[data-tag-links]:focus-visible]:bg-transparent has-[[data-tag-links]:focus-visible]:ring-0 has-[[data-tag-links]:hover]:bg-transparent has-[[data-tag-links]:hover]:ring-0",
            bookmark.unread && "bg-primary/15"
          )}>
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
                className="decoration-primary hover:decoration-primary/70 focus-visible:decoration-primary/70 hover:text-primary/70 focus-visible:text-primary/70 truncate text-xs underline underline-offset-2 transition-colors outline-none"
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer">
                {getCleanDomain(bookmark.url)}
              </a>
            </p>
          </section>
          <div
            tabIndex={0}
            role="button"
            data-sheet-trigger
            className="cursor-pointer outline-none"
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
                          className="transition-colors outline-none"
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
          </div>
        </div>
      ))}
    </div>
  );
}
