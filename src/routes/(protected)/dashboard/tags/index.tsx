import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { stopBulkSelectionOnEnterRoute } from "@/lib/loaders";
import { getAllQueryOptions } from "@/lib/queries";
import { EmptyTags } from "@/routes/(protected)/dashboard/tags/-components/empty-tag";
import TagTable from "@/routes/(protected)/dashboard/tags/-components/tag-table";

export const Route = createFileRoute("/(protected)/dashboard/tags/")({
  component: RouteComponent,
  onEnter: stopBulkSelectionOnEnterRoute,
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
