import { useForm } from "@tanstack/react-form";
import { LaptopIcon, LayoutGridIcon, ListIcon, MoonIcon, SunIcon, Table2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useIsMobile } from "@/hooks/use-mobile";
import { UrlSchema, useSettingsStore } from "@/lib/store";
import { cn, getErrorMessage } from "@/lib/utils";
import { useBackgroundSync } from "@/providers/background-sync";
import type { CacheName, Theme, View } from "@/types";

import CustomFieldError from "@/components/forms/custom-field-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type SettingsFormProps = React.ComponentProps<"div">;

export function SettingsForm({ className, ...props }: SettingsFormProps) {
  const {
    username,
    linkdingUrl,
    view,
    theme,
    sidebarAddOpen,
    limit,
    archivedDefault,
    unreadDefault,
    sharedDefault,
    autoMarkRead,
    setUsername,
    setLinkdingUrl,
    setView,
    setTheme,
    setSidebarAddOpen,
    setLimit,
    setArchivedDefault,
    setUnreadDefault,
    setSharedDefault,
    setAutoMarkRead,
  } = useSettingsStore(
    useShallow((state) => ({
      username: state.username,
      linkdingUrl: state.linkdingUrl,
      view: state.view,
      theme: state.theme,
      sidebarAddOpen: state.sidebarAddOpen,
      limit: state.limit,
      archivedDefault: state.archivedDefault,
      unreadDefault: state.unreadDefault,
      sharedDefault: state.sharedDefault,
      autoMarkRead: state.autoMarkRead,
      setUsername: state.setUsername,
      setLinkdingUrl: state.setLinkdingUrl,
      setView: state.setView,
      setTheme: state.setTheme,
      setSidebarAddOpen: state.setSidebarAddOpen,
      setLimit: state.setLimit,
      setArchivedDefault: state.setArchivedDefault,
      setUnreadDefault: state.setUnreadDefault,
      setSharedDefault: state.setSharedDefault,
      setAutoMarkRead: state.setAutoMarkRead,
    }))
  );

  const { isOnline, purgeAssets } = useBackgroundSync();
  const isMobile = useIsMobile();

  const form = useForm({
    defaultValues: {
      username,
      linkdingUrl,
      view,
      theme,
      sidebarAddOpen,
      limit,
      unreadDefault,
      archivedDefault,
      sharedDefault,
      autoMarkRead,
      appCache: false,
      linkdingCache: false,
    },
    onSubmit: ({ value }) => {
      try {
        setUsername(value.username);
        setLinkdingUrl(value.linkdingUrl);
        setView(value.view);
        setTheme(value.theme);
        setSidebarAddOpen(value.sidebarAddOpen);
        setLimit(Number(value.limit));
        setUnreadDefault(value.unreadDefault);
        setArchivedDefault(value.archivedDefault);
        setSharedDefault(value.sharedDefault);
        setAutoMarkRead(value.autoMarkRead);

        toast.success("Settings updated!");
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });

  function handlePurgeCache() {
    if (!isOnline) return;
    const isAppCache = form.getFieldValue("appCache");
    const isLinkdingCache = form.getFieldValue("linkdingCache");

    if (!isAppCache && !isLinkdingCache) {
      toast.error("Select at least one cache to clear.");
      return;
    }

    const cachesToPurge: Array<CacheName> = [];

    if (isAppCache) {
      cachesToPurge.push("app-assets");
      cachesToPurge.push("app-navigations");
    }
    if (isLinkdingCache) {
      cachesToPurge.push("linkding-assets");
      cachesToPurge.push("linkding-api-cache");
    }

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      cachesToPurge.forEach((cache) => purgeAssets(cache));

      form.setFieldValue("appCache", false);
      form.setFieldValue("linkdingCache", false);

      toast.success("Requested cache clear", {
        description: "The selected data will be refreshed on next load.",
      });
    } else {
      toast.error("Service Worker not active. Cannot clear cache.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}>
        <FieldSet>
          <FieldLegend className="text-muted-foreground">User settings</FieldLegend>
          <FieldGroup>
            <form.Field
              name="username"
              validators={{
                onBlur: z.string().min(1, "Username is required."),
              }}
              children={(field) => (
                <Field data-invalid={!field.state.meta.isValid}>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    type="text"
                    value={field.state.value}
                    aria-invalid={!field.state.meta.isValid}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <CustomFieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />

            <form.Field
              name="linkdingUrl"
              validators={{
                onBlur: UrlSchema,
              }}
              children={(field) => (
                <Field data-invalid={!field.state.meta.isValid}>
                  <FieldLabel htmlFor="linkdingUrl">Linkding URL</FieldLabel>
                  <Input
                    id="linkdingUrl"
                    type="text"
                    value={field.state.value}
                    aria-invalid={!field.state.meta.isValid}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {!field.state.meta.isValid && (
                    <CustomFieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator className="my-4" />

        <FieldSet>
          <FieldLegend className="text-muted-foreground">UI settings</FieldLegend>
          <FieldGroup>
            <form.Field
              name="theme"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="theme">Theme</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as Theme)}>
                    <SelectTrigger id="theme">
                      <SelectValue>
                        {field.state.value === "light" ? (
                          <SunIcon />
                        ) : field.state.value === "dark" ? (
                          <MoonIcon />
                        ) : (
                          <LaptopIcon />
                        )}
                        <span>{field.state.value}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem className="[&>div]:items-center" value="light">
                          <SunIcon />
                          <span>Light</span>
                        </SelectItem>
                        <SelectItem className="[&>div]:items-center" value="dark">
                          <MoonIcon />
                          <span>Dark</span>
                        </SelectItem>
                        <SelectItem className="[&>div]:items-center" value="system">
                          <LaptopIcon />
                          <span>System</span>
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <form.Field
              name="view"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="view">View</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as View)}>
                    <SelectTrigger id="view">
                      <SelectValue>
                        {field.state.value === "grid" ? (
                          <LayoutGridIcon />
                        ) : field.state.value === "list" ? (
                          <ListIcon />
                        ) : (
                          <Table2Icon />
                        )}
                        <span>{field.state.value}</span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="[&>div]:items-center" value="grid">
                        <LayoutGridIcon />
                        <span>Grid</span>
                      </SelectItem>
                      <SelectItem className="[&>div]:items-center" value="list">
                        <ListIcon />
                        <span>List</span>
                      </SelectItem>
                      <SelectItem className="[&>div]:items-center" value="table">
                        <Table2Icon />
                        <span>Table</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {!isMobile && (
              <form.Field
                name="sidebarAddOpen"
                children={(field) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="sidebarAddOpen">Sidebar add collapsible</FieldLabel>
                      <FieldDescription>
                        Choose whether the “Add” item in the sidebar is open or collapsed by
                        default.
                      </FieldDescription>
                    </FieldContent>
                    <Switch
                      id="sidebarAddOpen"
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                  </Field>
                )}
              />
            )}

            <form.Field
              name="limit"
              validators={{
                onChange: z.number().min(10, "Must have a minimum of 10."),
              }}
              children={(field) => (
                <Field data-invalid={!field.state.meta.isValid}>
                  <FieldLabel htmlFor="limit">Results per page</FieldLabel>
                  <Input
                    id="limit"
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    aria-invalid={!field.state.meta.isValid}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                  {!field.state.meta.isValid && (
                    <CustomFieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldSeparator className="my-4" />

        <FieldSet>
          <FieldLegend className="text-muted-foreground">Bookmark settings</FieldLegend>
          <FieldGroup>
            <form.Field
              name="archivedDefault"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="archivedDefault">Archived</FieldLabel>
                    <FieldDescription>
                      Sets the default state to “Archived” when creating a new bookmark.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="archivedDefault"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </Field>
              )}
            />

            <form.Field
              name="unreadDefault"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="unreadDefault">Unread</FieldLabel>
                    <FieldDescription>
                      Sets the default state to “Unread” when creating a new bookmark.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="unreadDefault"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </Field>
              )}
            />

            <form.Field
              name="sharedDefault"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="sharedDefault">Shared</FieldLabel>
                    <FieldDescription>
                      Sets the default state to “Shared” when creating a new bookmark.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="sharedDefault"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </Field>
              )}
            />

            <FieldSeparator />

            <form.Field
              name="autoMarkRead"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="autoMarkRead">Auto-mark as read</FieldLabel>
                    <FieldDescription>
                      Automatically mark a bookmark as read after you have viewed it.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="autoMarkRead"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </FieldSet>

        <FieldGroup className="mt-8">
          <Button className="text-foreground cursor-pointer" type="submit">
            Update
          </Button>
        </FieldGroup>

        <FieldSeparator className="my-4" />

        <FieldGroup>
          <FieldSet>
            <FieldLegend className="text-muted-foreground">Cache settings</FieldLegend>
            <FieldGroup className="mb-3">
              <FieldLabel className="text-destructive mb-1">Danger Zone</FieldLabel>
              <FieldDescription>
                Use this to clear cached data if things aren’t updating correctly. This is disabled
                if offline.
              </FieldDescription>
            </FieldGroup>
            <FieldGroup data-slot="checkbox-group" className="mb-3">
              <form.Field
                name="appCache"
                children={(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="appCache"
                      disabled={!isOnline}
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onCheckedChange={(val) => field.handleChange(val)}
                    />
                    <FieldLabel htmlFor="appCache" className="font-normal">
                      EchoLink
                    </FieldLabel>
                  </Field>
                )}
              />

              <form.Field
                name="linkdingCache"
                children={(field) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="linkdingCache"
                      disabled={!isOnline}
                      name={field.name}
                      checked={field.state.value}
                      onBlur={field.handleBlur}
                      onCheckedChange={(val) => field.handleChange(val)}
                    />
                    <FieldLabel htmlFor="linkdingCache" className="font-normal">
                      Linkding
                    </FieldLabel>
                  </Field>
                )}
              />
            </FieldGroup>
            <Button
              disabled={!isOnline}
              variant="destructive"
              type="button"
              className="enabled:cursor-pointer"
              onClick={handlePurgeCache}>
              Clear cache
            </Button>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
