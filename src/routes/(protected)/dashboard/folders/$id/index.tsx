import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { safeEnsure } from "@/lib/api";
import { getAllQueryOptions } from "@/lib/queries";
import { SearchSchema, transformData } from "@/lib/search";
import { useSettingsStore } from "@/lib/store";
import { EmptyFolder } from "@/routes/(protected)/dashboard/folders/-components/empty-folder";
import FolderActionDropdown from "@/routes/(protected)/dashboard/folders/-components/folder-action-dropdown";

import BookmarkWrapper from "@/components/blocks/bookmark";

export const Route = createFileRoute("/(protected)/dashboard/folders/$id/")({
  validateSearch: (search) => {
    const parsed = SearchSchema.parse(search);
    const limit = useSettingsStore.getState().limit;

    return {
      ...parsed,
      limit: parsed.limit ?? limit,
    };
  },
  loader: async ({ context: { queryClient }, params: { id } }) => {
    try {
      await safeEnsure(queryClient, getAllQueryOptions.folderById(id));

      await safeEnsure(queryClient, getAllQueryOptions.bookmarksByFolderId(id));
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        throw notFound();
      }
      throw error;
    }
  },
  component: FolderComponent,
});

function FolderComponent() {
  const { id } = Route.useParams();
  const search = Route.useSearch();

  const { data: folder } = useSuspenseQuery(getAllQueryOptions.folderById(id));
  const { data: bookmarks } = useSuspenseQuery(getAllQueryOptions.bookmarksByFolderId(id));

  const { items, totalCount, totalPages, hasNextCurrent, hasPreviousCurrent } = useMemo(() => {
    return transformData(bookmarks, search);
  }, [bookmarks, search]);

  return (
    <BookmarkWrapper
      appRouteId="/(protected)/dashboard/folders/$id/"
      heading={folder.name}
      bookmarkItems={items}
      totalCount={totalCount}
      totalPages={totalPages}
      hasNextCurrent={hasNextCurrent}
      hasPreviousCurrent={hasPreviousCurrent}
      emptyComponent={<EmptyFolder id={folder.id} name={folder.name} />}>
      <FolderActionDropdown id={folder.id} name={folder.name} />
    </BookmarkWrapper>
  );
}
