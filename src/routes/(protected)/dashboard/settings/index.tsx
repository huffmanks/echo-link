import { createFileRoute } from "@tanstack/react-router";

import { SettingsForm } from "@/components/forms/settings-form";

export const Route = createFileRoute("/(protected)/dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-lg px-4 pt-4 pb-8 md:pt-0">
      <h1 className="mb-4 text-2xl font-medium">Settings</h1>
      <SettingsForm />
    </div>
  );
}
