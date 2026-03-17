import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { getAllQueryOptions } from "@/lib/queries";
import type { Bookmark } from "@/types";

import { BookmarkForm } from "@/components/forms/bookmark-form";

export const Route = createFileRoute("/(protected)/dashboard/bookmarks/$id/edit")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    const query = getAllQueryOptions.bookmarkById(id);

    const cached = queryClient.getQueryData(query.queryKey);
    if (cached) return;

    const lists = queryClient.getQueriesData<{ results?: Array<Bookmark> }>({
      queryKey: ["bookmarks"],
    });

    for (const [, data] of lists) {
      const found = data?.results?.find((b) => String(b.id) === String(id));
      if (found) {
        queryClient.setQueryData(query.queryKey, found);
        return;
      }
    }

    if (navigator.onLine) {
      await queryClient.ensureQueryData(query);
      return;
    }

    return;
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: bookmark } = useSuspenseQuery(getAllQueryOptions.bookmarkById(id));

  return (
    <div className="max-w-lg px-4 pt-4 pb-8 md:pt-0">
      <h1 className="mb-4 text-2xl font-medium">Edit bookmark</h1>
      <BookmarkForm bookmark={bookmark} />
    </div>
  );
}
