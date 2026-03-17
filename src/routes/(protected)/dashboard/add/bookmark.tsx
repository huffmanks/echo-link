import { createFileRoute } from "@tanstack/react-router";

import { BookmarkForm } from "@/components/forms/bookmark-form";

export const Route = createFileRoute("/(protected)/dashboard/add/bookmark")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-lg px-4 pt-4 pb-8 md:pt-0">
      <h1 className="mb-4 text-2xl font-medium">Add bookmark</h1>
      <BookmarkForm />
    </div>
  );
}
