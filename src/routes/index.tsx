import { createFileRoute, redirect } from "@tanstack/react-router";

import { useSettingsStore } from "@/lib/store/settings";

import { SetupForm } from "@/components/forms/setup-form";
import FullScreenWrapper from "@/components/full-screen-wrapper";

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: async () => {
    const { isSetupComplete, limit } = useSettingsStore.getState();

    if (isSetupComplete) {
      throw redirect({ to: "/dashboard", search: { limit } });
    }
  },
});

function App() {
  return (
    <FullScreenWrapper className="min-h-svh justify-center">
      <SetupForm />
    </FullScreenWrapper>
  );
}
