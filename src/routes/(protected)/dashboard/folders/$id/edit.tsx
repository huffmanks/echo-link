import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { safeEnsure } from "@/lib/api";
import { getAllQueryOptions } from "@/lib/queries";

import { FolderForm } from "@/components/forms/folder-form";

export const Route = createFileRoute("/(protected)/dashboard/folders/$id/edit")({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params: { id } }) => {
    try {
      await safeEnsure(queryClient, getAllQueryOptions.folderById(id));
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        throw notFound();
      }
      throw error;
    }
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: folder } = useSuspenseQuery(getAllQueryOptions.folderById(id));

  return (
    <div className="max-w-lg px-4 pt-4 pb-8 md:pt-0">
      <h1 className="mb-4 text-2xl font-medium">Edit folder</h1>
      <FolderForm folder={folder} />
    </div>
  );
}
