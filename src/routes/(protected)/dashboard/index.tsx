import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookmarkIcon } from "lucide-react";

import { safeEnsure } from "@/lib/api";
import { getAllQueryOptions } from "@/lib/queries";
import { SearchSchema, transformData } from "@/lib/search";
import { useSettingsStore } from "@/lib/store";

import BookmarkWrapper from "@/components/blocks/bookmark";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const Route = createFileRoute("/(protected)/dashboard/")({
  component: RouteComponent,
  validateSearch: (search) => {
    const parsed = SearchSchema.parse(search);
    const { limit } = useSettingsStore.getState();

    return {
      ...parsed,
      limit: parsed.limit ?? limit,
    };
  },
  loaderDeps: ({ search: { q } }) => ({
    q: q ?? "",
  }),
  loader: async ({ context: { queryClient }, deps: { q } }) =>
    await safeEnsure(queryClient, getAllQueryOptions.bookmarkList(q)),
});

function RouteComponent() {
  const search = Route.useSearch();

  const { data: rawData } = useSuspenseQuery(getAllQueryOptions.bookmarkList(search.q));

  const { items, totalCount, totalPages, hasNextCurrent, hasPreviousCurrent } = useMemo(() => {
    return transformData(rawData, search);
  }, [rawData, search]);

  return (
    <BookmarkWrapper
      appRouteId="/(protected)/dashboard/"
      heading="Bookmarks"
      bookmarkItems={items}
      totalCount={totalCount}
      totalPages={totalPages}
      hasNextCurrent={hasNextCurrent}
      hasPreviousCurrent={hasPreviousCurrent}
      emptyComponent={<EmptyBookmarks />}
    />
  );
}

function EmptyBookmarks() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookmarkIcon />
        </EmptyMedia>
        <EmptyTitle>No bookmarks yet</EmptyTitle>
        <EmptyDescription>
          You haven’t created any bookmarks yet. Get started by creating your first bookmark.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button
            nativeButton={false}
            render={<Link to="/dashboard/add/bookmark">Create bookmark</Link>}></Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
