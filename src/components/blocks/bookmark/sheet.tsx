import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ExternalLinkIcon, FileCodeIcon, LandmarkIcon, Link2Icon } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { useShallow } from "zustand/react/shallow";

import { useIsMobile } from "@/hooks/use-mobile";
import { linkdingFetch } from "@/lib/api";
import { useDeleteBookmark, useToggleReadBookmark } from "@/lib/mutations";
import { useSettingsStore } from "@/lib/store";
import { formatToLocalTime, getRelativeTimeString, joinUrlPath } from "@/lib/utils";
import type { Asset, Bookmark } from "@/types";

import SharedButton from "@/components/blocks/bookmark/shared-button";
import TagCloud from "@/components/blocks/bookmark/tag-cloud";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface BookmarkSheetProps {
  bookmark: Bookmark;
  isOpen: boolean;
  handleOpenChange: (open: boolean) => void;
}

export default function BookmarkSheet({ bookmark, isOpen, handleOpenChange }: BookmarkSheetProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerPopup className="px-0">
          <DrawerContent>
            <div className="mb-2">
              <DrawerTitle className="text-base font-medium">Details</DrawerTitle>
              <DrawerDescription className="sr-only">Bookmark information</DrawerDescription>
            </div>
            <div
              className="scrollbar mr-2 max-h-[70vh] overflow-y-auto pb-8"
              style={{ scrollbarGutter: "stable" }}>
              <Content bookmark={bookmark} handleOpenChange={handleOpenChange} />
            </div>
          </DrawerContent>
        </DrawerPopup>
      </Drawer>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="gap-0" side="right">
        <SheetHeader>
          <SheetTitle className="text-base font-medium">Details</SheetTitle>
          <SheetDescription className="sr-only">Bookmark information</SheetDescription>
        </SheetHeader>
        <div className="scrollbar overflow-y-auto pb-8">
          <Content bookmark={bookmark} handleOpenChange={handleOpenChange} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Content({
  bookmark,
  handleOpenChange,
}: {
  bookmark: Bookmark;
  handleOpenChange: (open: boolean) => void;
}) {
  const [hasError, setHasError] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["assets", bookmark.id],
    queryFn: () => linkdingFetch<{ results: Array<Asset> }>(`bookmarks/${bookmark.id}/assets`),
  });

  const { linkdingUrl, autoMarkRead } = useSettingsStore(
    useShallow((state) => ({
      linkdingUrl: state.linkdingUrl,
      autoMarkRead: state.autoMarkRead,
    }))
  );
  const { mutate: toggleReadBookmark } = useToggleReadBookmark();

  const { mutate } = useDeleteBookmark();

  function handleDelete() {
    mutate(bookmark.id);
    handleOpenChange(false);
  }

  const assets = useMemo(() => {
    if (isLoading || !data?.results) return null;

    const snapshots = data.results
      .filter((item) => item.asset_type === "snapshot")
      .sort((a, b) => b.date_created.localeCompare(a.date_created))
      .map((item) => {
        return {
          url: joinUrlPath(linkdingUrl, `/assets/${item.id}`),
          displayName: `Created: ${formatToLocalTime(item.date_created)}`,
        };
      });

    let image = bookmark?.preview_image_url;

    if (!image) {
      const latestImage = data.results
        .filter((item) => item.content_type?.startsWith("image/"))
        .sort((a, b) => b.date_created.localeCompare(a.date_created))[0];

      if (latestImage) {
        image = joinUrlPath(linkdingUrl, `/assets/${latestImage.id}`);
      }
    }

    return {
      ...(snapshots.length > 0 && { snapshots }),
      ...(image && { image }),
    };
  }, [data?.results, isLoading]);

  useEffect(() => {
    if (bookmark.unread && autoMarkRead) {
      toggleReadBookmark({ id: bookmark.id, unread: false });
    }
  }, []);

  return (
    <div className="mt-3 px-4">
      <div className="mb-3">
        {assets?.image && !hasError && (
          <img
            className="max-h-64 w-full rounded-lg object-cover"
            src={assets.image}
            alt={bookmark.title}
            onError={() => setHasError(true)}
          />
        )}
      </div>

      <section className="mb-3 flex items-center gap-1">
        <SharedButton
          title={bookmark.title}
          text={bookmark.description}
          url={bookmark.url}
          isShared={bookmark.shared}
        />

        {bookmark.is_archived && <Badge variant="secondary">Archived</Badge>}
      </section>

      <section className="mb-5 space-y-1">
        <h2 className="text-lg font-bold">{bookmark.title}</h2>
        {bookmark?.description ? (
          <p className="text-muted-foreground text-sm">{bookmark.description}</p>
        ) : (
          <p className="text-muted-foreground text-sm">No description.</p>
        )}
      </section>

      <section className="mb-5 space-y-2">
        <h3 className="font-medium">Links</h3>
        <InputGroup>
          <InputGroupInput disabled readOnly defaultValue={bookmark.url} className="truncate" />
          <InputGroupAddon>
            <Link2Icon className="stroke-foreground size-4" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
              <ExternalLinkIcon className="text-primary size-4" />
            </a>
          </InputGroupAddon>
        </InputGroup>

        {bookmark?.web_archive_snapshot_url && (
          <InputGroup>
            <InputGroupInput
              disabled
              readOnly
              defaultValue={bookmark.web_archive_snapshot_url}
              className="truncate"
            />
            <InputGroupAddon>
              <LandmarkIcon className="stroke-foreground size-4" />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <a href={bookmark.web_archive_snapshot_url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="text-primary size-4" />
              </a>
            </InputGroupAddon>
          </InputGroup>
        )}
      </section>

      {assets?.snapshots && (
        <section className="mb-5 space-y-2">
          <h3 className="font-medium">HTML snapshots</h3>
          {assets.snapshots.map((snapshot) => (
            <InputGroup key={snapshot.url}>
              <InputGroupInput
                disabled
                readOnly
                defaultValue={snapshot.displayName}
                className="truncate"
              />
              <InputGroupAddon>
                <FileCodeIcon className="stroke-foreground size-4" />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <a href={snapshot.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="text-primary size-4" />
                </a>
              </InputGroupAddon>
            </InputGroup>
          ))}
        </section>
      )}

      <section className="mb-5 space-y-2">
        <h3 className="font-medium">Tags</h3>
        <TagCloud tags={bookmark.tag_names} handleOpenChange={handleOpenChange} />
      </section>

      <section className="mb-5 space-y-2">
        <h3 className="font-medium">Notes</h3>
        {bookmark.notes ? (
          <div className="prose prose-neutral prose-sm prose-pre:overflow-x-auto prose-pre:max-w-full dark:prose-invert bg-input/30 max-w-none rounded-md p-4">
            <Markdown>{bookmark.notes}</Markdown>
          </div>
        ) : (
          <Textarea
            className="min-h-fit resize-none disabled:cursor-auto"
            disabled
            readOnly
            defaultValue="No notes"></Textarea>
        )}
      </section>

      {bookmark?.date_added && bookmark?.date_modified && (
        <section className="text-muted-foreground mb-5 space-y-1 text-xs">
          <p>Created: {getRelativeTimeString(bookmark.date_added)}</p>
          <p>Last modified: {getRelativeTimeString(bookmark.date_modified)}</p>
        </section>
      )}

      <section className="flex justify-end">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            nativeButton={false}
            render={
              <Link to="/dashboard/bookmarks/$id/edit" params={{ id: String(bookmark.id) }}>
                Edit
              </Link>
            }
          />

          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button className="cursor-pointer" variant="destructive">
                  Delete
                </Button>
              }></AlertDialogTrigger>
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
        </div>
      </section>
    </div>
  );
}
