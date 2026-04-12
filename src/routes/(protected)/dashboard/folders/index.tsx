import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { safeEnsure } from "@/lib/api";
import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { FOLDER_BULK_SELECT_OPTIONS } from "@/lib/constants";
import { stopBulkSelectionOnEnterRoute } from "@/lib/loaders";
import { useDeleteFolder } from "@/lib/mutations";
import { getAllQueryOptions } from "@/lib/queries";
import { useSettingsStore } from "@/lib/store";
import { EmptyFolders } from "@/routes/(protected)/dashboard/folders/-components/empty-folder";
import FolderTable from "@/routes/(protected)/dashboard/folders/-components/folder-table";
import type { Folder, PaginatedResponse } from "@/types";

import BulkActionBar from "@/components/blocks/bookmark/bulk-action-bar";

export const Route = createFileRoute("/(protected)/dashboard/folders/")({
  component: RouteComponent,
  onEnter: stopBulkSelectionOnEnterRoute,
  loader: async ({ context: { queryClient } }) => {
    const folders = (await safeEnsure(
      queryClient,
      getAllQueryOptions.folders
    )) as PaginatedResponse<Folder>;
    for (const folder of folders.results) {
      await safeEnsure(queryClient, getAllQueryOptions.bookmarksByFolderId(String(folder.id)));
    }
  },
});

function RouteComponent() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: folders } = useSuspenseQuery(getAllQueryOptions.folders);

  const { mutate: deleteFolder } = useDeleteFolder();

  const { selectedIds, bulkAction, clearSelection, setCurrentBulkAction, stopBulkSelection } =
    useBulkSelectionStore(
      useShallow((state) => ({
        selectedIds: state.selectedIds,
        bulkAction: state.bulkAction,
        clearSelection: state.clearSelection,
        setCurrentBulkAction: state.setCurrentBulkAction,
        stopBulkSelection: state.stopBulkSelection,
      }))
    );
  const { continueBulkEdit, keepBulkSelection } = useSettingsStore(
    useShallow((state) => ({
      continueBulkEdit: state.continueBulkEdit,
      keepBulkSelection: state.keepBulkSelection,
    }))
  );

  if (!folders.results.length) {
    return <EmptyFolders />;
  }

  async function handleBulkEdit() {
    if (!bulkAction || selectedIds.size === 0) return;

    try {
      const promises = Array.from(selectedIds).map((id) => {
        if (bulkAction === "delete") {
          return deleteFolder(id);
        }
      });

      const batchPromise = Promise.all(promises);

      toast.promise(batchPromise, {
        loading: `Executing ${bulkAction} on ${selectedIds.size} items...`,
        success: () => {
          handlePostBulkAction();

          return "Bulk actions completed!";
        },
        error: "Error, something went wrong!",
      });
    } catch (error) {}
  }

  function handlePostBulkAction() {
    if (!continueBulkEdit) {
      stopBulkSelection();
    } else if (!keepBulkSelection) {
      clearSelection();
    } else {
      setCurrentBulkAction(null);
    }

    setIsAlertOpen(false);
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4 sm:px-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">Folders</h1>
        </div>
        <div>
          <BulkActionBar
            entityName="folder"
            selectOptions={FOLDER_BULK_SELECT_OPTIONS}
            isAlertOpen={isAlertOpen}
            setIsAlertOpen={setIsAlertOpen}
            handleBulkEdit={handleBulkEdit}
            handlePostBulkAction={handlePostBulkAction}
          />
        </div>
      </div>
      <div className="pb-6 sm:px-2">
        <FolderTable initialFolders={folders} />
      </div>
    </>
  );
}
