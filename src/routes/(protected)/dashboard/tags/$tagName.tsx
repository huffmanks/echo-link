import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { safeEnsure } from "@/lib/api";
import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { getAllQueryOptions } from "@/lib/queries";
import { SearchSchema, transformData } from "@/lib/search";
import { useSettingsStore } from "@/lib/store";
import { EmptyTag } from "@/routes/(protected)/dashboard/tags/-components/empty-tag";
import type { PaginatedResponse, Tag } from "@/types";

import BookmarkWrapper from "@/components/blocks/bookmark";

export const Route = createFileRoute("/(protected)/dashboard/tags/$tagName")({
  component: RouteComponent,
  validateSearch: (search) => {
    const parsed = SearchSchema.parse(search);
    const { limit } = useSettingsStore.getState();

    return {
      ...parsed,
      limit: limit ?? parsed.limit,
    };
  },
  beforeLoad: ({ preload }) => {
    if (!preload) {
      useBulkSelectionStore.getState().stopBulkSelection();
    }
  },
  loader: async ({ context: { queryClient }, params: { tagName } }) => {
    try {
      const tags = (await safeEnsure(
        queryClient,
        getAllQueryOptions.tags
      )) as PaginatedResponse<Tag>;

      const tagExists = tags.results.some((t) => t.name.toLowerCase() === tagName.toLowerCase());

      if (!tagExists) {
        throw notFound();
      }

      await safeEnsure(queryClient, getAllQueryOptions.bookmarksByTagName(tagName));
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        throw notFound();
      }
      throw error;
    }
  },
});

function RouteComponent() {
  const { tagName } = Route.useParams();
  const search = Route.useSearch();

  const { data: rawData } = useSuspenseQuery(getAllQueryOptions.bookmarksByTagName(tagName));

  const { items, totalCount, totalPages, hasNextCurrent, hasPreviousCurrent } = useMemo(() => {
    return transformData(rawData, search);
  }, [rawData, search]);

  return (
    <BookmarkWrapper
      appRouteId="/(protected)/dashboard/tags/$tagName"
      heading={`#${tagName}`}
      bookmarkItems={items}
      totalCount={totalCount}
      totalPages={totalPages}
      hasNextCurrent={hasNextCurrent}
      hasPreviousCurrent={hasPreviousCurrent}
      emptyComponent={<EmptyTag name={tagName} />}
    />
  );
}
