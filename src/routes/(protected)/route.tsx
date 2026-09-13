import { createFileRoute, redirect } from "@tanstack/react-router";

import { safeEnsure } from "@/lib/api";
import { validate } from "@/lib/auth";
import { getAllQueryOptions } from "@/lib/queries";
import { useSettingsStore } from "@/lib/store/settings";

import Sidebar from "@/components/blocks/sidebar";

export const Route = createFileRoute("/(protected)")({
  component: RouteComponent,
  beforeLoad: async () => {
    const { isSetupComplete } = useSettingsStore.getState();
    if (!isSetupComplete) {
      throw redirect({ to: "/", replace: true });
    }

    const { isValid } = await validate();

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
      <Sidebar />
    </>
  );
}
