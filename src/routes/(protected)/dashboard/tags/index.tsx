import { createFileRoute } from "@tanstack/react-router";

import { useBulkSelectionStore } from "@/lib/bulk-selection-store";
import { EmptyTags } from "@/routes/(protected)/dashboard/tags/-components/empty-tag";

export const Route = createFileRoute("/(protected)/dashboard/tags/")({
  component: RouteComponent,
  beforeLoad: ({ preload }) => {
    if (!preload) {
      useBulkSelectionStore.getState().stopBulkSelection();
    }
  },
});

function RouteComponent() {
  return <EmptyTags />;
}
