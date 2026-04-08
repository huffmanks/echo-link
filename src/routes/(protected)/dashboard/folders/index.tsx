import { useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useShallow } from "zustand/react/shallow";

import { safeEnsure } from "@/lib/api";
import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { getAllQueryOptions } from "@/lib/queries";
import { useSettingsStore } from "@/lib/store";
import { EmptyFolders } from "@/routes/(protected)/dashboard/folders/-components/empty-folder";
import FolderTable from "@/routes/(protected)/dashboard/folders/-components/folder-table";

import BulkActionBar from "@/components/blocks/bookmark/bulk-action-bar";

export const Route = createFileRoute("/(protected)/dashboard/folders/")({
  component: RouteComponent,
  beforeLoad: ({ preload }) => {
    if (!preload) {
      useBulkSelectionStore.getState().stopBulkSelection();
    }
  },
  loader: async ({ context: { queryClient } }) => {
    try {
      await safeEnsure(queryClient, getAllQueryOptions.folders);
    } catch (error) {
      if (error instanceof Error && error.message.includes("404")) {
        throw notFound();
      }
      throw error;
    }
  },
});

function RouteComponent() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: folders } = useSuspenseQuery(getAllQueryOptions.folders);

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
    // TODO
    try {
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
