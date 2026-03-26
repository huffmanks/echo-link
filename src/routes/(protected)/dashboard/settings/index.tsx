import { createFileRoute } from "@tanstack/react-router";

import { BookmarkSettingsForm } from "@/components/forms/settings/bookmark-settings-form";
import { CacheSettingsForm } from "@/components/forms/settings/cache-settings-form";
import { UiSettingsForm } from "@/components/forms/settings/ui-settings-form";
import { UserSettingsForm } from "@/components/forms/settings/user-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/(protected)/dashboard/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="max-w-lg px-4 pt-4 pb-8 md:pt-0">
      <h1 className="mb-4 text-2xl font-medium">Settings</h1>

      <Tabs defaultValue="user">
        <TabsList className="w-full p-0">
          <TabsTrigger value="user" className="cursor-pointer">
            User
          </TabsTrigger>
          <TabsTrigger value="ui" className="cursor-pointer">
            UI
          </TabsTrigger>
          <TabsTrigger value="bookmark" className="cursor-pointer">
            Bookmark
          </TabsTrigger>
          <TabsTrigger value="cache" className="cursor-pointer">
            Cache
          </TabsTrigger>
        </TabsList>
        <div className="pt-4">
          <TabsContent value="user">
            <UserSettingsForm />
          </TabsContent>
          <TabsContent value="ui">
            <UiSettingsForm />
          </TabsContent>
          <TabsContent value="bookmark">
            <BookmarkSettingsForm />
          </TabsContent>
          <TabsContent value="cache">
            <CacheSettingsForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
