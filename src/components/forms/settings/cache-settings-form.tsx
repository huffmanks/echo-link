import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import { useBackgroundSync } from "@/hooks/use-background-sync";
import { cn } from "@/lib/utils";
import type { CacheName } from "@/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

type CacheSettingsFormProps = React.ComponentProps<"div">;

export function CacheSettingsForm({ className, ...props }: CacheSettingsFormProps) {
  const { isOnline, purgeAssets } = useBackgroundSync();

  const form = useForm({
    defaultValues: {
      appCache: false,
      linkdingCache: false,
    },
    onSubmit: ({ value }) => {
      if (!isOnline) return;
      const isAppCache = value.appCache;
      const isLinkdingCache = value.linkdingCache;

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
        for (const cache of cachesToPurge) {
          purgeAssets(cache);
        }

        form.setFieldValue("appCache", false);
        form.setFieldValue("linkdingCache", false);

        toast.success("Cache cleared", {
          description: "The selected cache has been cleared.",
        });
      } else {
        toast.error("Service Worker not active. Cannot clear cache.");
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await form.handleSubmit();
        }}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend className="text-destructive">Danger zone</FieldLegend>
            <FieldGroup className="mb-3 gap-1">
              <FieldLabel className="mb-1">Sources</FieldLabel>
              <FieldDescription>
                Use this to clear cached data if content isn’t updating. Disabled while offline.
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
              type="submit"
              className="enabled:cursor-pointer">
              Clear cache
            </Button>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
