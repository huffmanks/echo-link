import { createFileRoute, redirect } from "@tanstack/react-router";

import { validate } from "@/lib/auth";
import { useSettingsStore } from "@/lib/store";

import { SetupForm } from "@/components/forms/setup-form";
import FullScreenWrapper from "@/components/full-screen-wrapper";

export const Route = createFileRoute("/")({
  component: App,
  beforeLoad: async () => {
    const { isSetupComplete, limit } = useSettingsStore.getState();

    if (!isSetupComplete) return;

    const { isValid } = await validate();

    if (isValid) {
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
