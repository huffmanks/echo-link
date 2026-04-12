import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { safeEnsure } from "@/lib/api";
import { stopBulkSelectionOnEnterRoute } from "@/lib/loaders";
import { getAllQueryOptions } from "@/lib/queries";
import { EmptyTags } from "@/routes/(protected)/dashboard/tags/-components/empty-tag";
import TagTable from "@/routes/(protected)/dashboard/tags/-components/tag-table";
import type { PaginatedResponse, Tag } from "@/types";

export const Route = createFileRoute("/(protected)/dashboard/tags/")({
  component: RouteComponent,
  onEnter: stopBulkSelectionOnEnterRoute,
  loader: async ({ context: { queryClient } }) => {
    const tags = (await safeEnsure(queryClient, getAllQueryOptions.tags)) as PaginatedResponse<Tag>;
    for (const tag of tags.results) {
      await safeEnsure(queryClient, getAllQueryOptions.bookmarksByTagName(tag.name));
    }
  },
});

function RouteComponent() {
  const { data: tags } = useSuspenseQuery(getAllQueryOptions.tags);

  if (!tags.results.length) {
    return <EmptyTags />;
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 sm:px-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Tags</h1>
        </div>
      </div>
      <div className="pb-6 sm:px-2">
        <TagTable initialTags={tags} />
      </div>
    </>
  );
}
