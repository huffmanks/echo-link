import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";

import { linkdingFetch } from "@/lib/api";
import { useSettingsStore } from "@/lib/store";
import { cn, getCleanDomain, getRelativeTimeString, joinUrlPath } from "@/lib/utils";
import { useBulkSelection } from "@/providers/bulk-selection";
import type { Asset, Bookmark } from "@/types";

import ActionDropdown from "@/components/blocks/bookmark/action-dropdown";
import BookmarkFavicon from "@/components/blocks/bookmark/bookmark-favicon";
import { AllCheckbox, ItemCheckbox } from "@/components/blocks/bookmark/checkboxes";
import SharedButton from "@/components/blocks/bookmark/shared-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BookmarkGridViewProps {
  bookmarks: Array<Bookmark>;
  count: number;
  handleOpenSheet: (bookmark: Bookmark) => void;
  handleOpenChange: (open: boolean) => void;
}

export default function BookmarkGridView({
  bookmarks,
  count,
  handleOpenSheet,
  handleOpenChange,
}: BookmarkGridViewProps) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelection();

  const allBookmarkIds = bookmarks.map((bookmark) => bookmark.id);

  return (
    <>
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
      <div className="grid gap-4 px-1 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {bookmarks.map((bookmark) => (
          <Card
            key={bookmark.id}
            className={cn(
              "gap-4 pt-0 pb-4",
              bookmark.unread && "bg-primary/10",
              isBulkSelecting && "hover:ring-primary/50 cursor-pointer hover:ring-2"
            )}
            onClick={() => {
              if (isBulkSelecting) {
                toggleIdSelection(bookmark.id);
              }
            }}>
            <CardImage bookmark={bookmark} handleOpenSheet={handleOpenSheet} />
            <CardHeader className="pr-1 pl-3.5">
              <CardTitle className="flex min-w-0 items-center gap-2">
                <BookmarkFavicon bookmark={bookmark} />
                <h2 className="truncate text-sm font-medium">{bookmark.title}</h2>
              </CardTitle>
              <CardDescription className="space-y-1">
                <p>
                  <a
                    className={cn(
                      "text-xs underline underline-offset-2 transition-colors outline-none",
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
                {bookmark?.description && (
                  <p className="text-muted-foreground mb-2 line-clamp-2 text-xs">
                    {bookmark.description}
                  </p>
                )}
                {bookmark?.date_added && (
                  <p className={cn("text-foreground text-xs", !bookmark?.description && "mt-2")}>
                    {getRelativeTimeString(new Date(bookmark.date_added))}
                  </p>
                )}
              </CardDescription>
              <CardAction>
                <ActionDropdown
                  triggerButtonClassName="-mt-1.5"
                  bookmark={bookmark}
                  handleOpenSheet={handleOpenSheet}
                  handleOpenChange={handleOpenChange}
                />
              </CardAction>
            </CardHeader>
            <CardContent className={cn("mt-auto px-3")}>
              <section className="flex items-center gap-1">
                <SharedButton
                  title={bookmark.title}
                  text={bookmark.description}
                  url={bookmark.url}
                  isShared={bookmark.shared}
                />

                {bookmark.is_archived && <Badge variant="secondary">Archived</Badge>}

                {bookmark?.tag_names &&
                  bookmark.tag_names.map((tag) => (
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
              </section>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function CardImage({
  bookmark,
  handleOpenSheet,
}: {
  bookmark: Bookmark;
  handleOpenSheet: (bookmark: Bookmark) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["assets", bookmark.id],
    queryFn: () => linkdingFetch<{ results: Array<Asset> }>(`bookmarks/${bookmark.id}/assets`),
  });

  const linkdingUrl = useSettingsStore((state) => state.linkdingUrl);
  const { isBulkSelecting } = useBulkSelection();

  const assets = useMemo(() => {
    if (isLoading || !data?.results) return null;

    let image = bookmark?.preview_image_url;

    if (!image) {
      const latestImage = data.results
        .filter((item) => item.content_type?.startsWith("image/"))
        .sort((a, b) => b.date_created.localeCompare(a.date_created))[0];

      if (latestImage) {
        image = joinUrlPath(linkdingUrl, `/assets/${latestImage.id}`);
      }
    }

    if (!image) return null;

    return { image };
  }, [data?.results, isLoading]);

  return (
    <button
      tabIndex={isBulkSelecting ? -1 : 0}
      className={cn("relative cursor-pointer", isBulkSelecting && "pointer-events-none")}
      aria-label="toggle expand sheet"
      onClick={() => {
        if (!isBulkSelecting) {
          handleOpenSheet(bookmark);
        }
      }}>
      {bookmark.unread && (
        <div className="bg-primary/5 absolute inset-0">
          <div className="bg-primary absolute top-2 left-2 size-2 rounded-full"></div>
        </div>
      )}

      <div className="absolute top-2 right-2">
        <div
          className={cn(
            "overflow-hidden transition-[width] [interpolate-size:allow-keywords]",
            isBulkSelecting ? "w-auto" : "w-0"
          )}>
          <ItemCheckbox id={bookmark.id} />
        </div>
      </div>

      {assets?.image ? (
        <img
          className="bg-muted h-40 w-full rounded-t-lg object-cover"
          src={assets.image}
          alt={bookmark.title}
        />
      ) : (
        <div className="bg-muted flex aspect-21/9 h-40 w-full items-center justify-center rounded-t-lg">
          <ImageIcon className="stroke-muted-foreground size-8 stroke-1" />
        </div>
      )}
    </button>
  );
}
