import { createFileRoute, redirect } from "@tanstack/react-router";

import { safeEnsure } from "@/lib/api";
import { checkAuth } from "@/lib/auth";
import { getAllQueryOptions } from "@/lib/queries";
import { BulkSelectionProvider } from "@/providers/bulk-selection";

import Sidebar from "@/components/blocks/sidebar";

export const Route = createFileRoute("/(protected)")({
  component: RouteComponent,
  beforeLoad: async () => {
    const { isValid } = await checkAuth();

    if (!isValid) {
      throw redirect({ to: "/", replace: true });
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      safeEnsure(queryClient, getAllQueryOptions.bookmarks),
      safeEnsure(queryClient, getAllQueryOptions.folders),
      safeEnsure(queryClient, getAllQueryOptions.tags),
    ]);
  },
});

function RouteComponent() {
  return (
    <>
      <BulkSelectionProvider>
        <Sidebar />
      </BulkSelectionProvider>
    </>
  );
}
