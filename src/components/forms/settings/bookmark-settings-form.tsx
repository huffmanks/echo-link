import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store/settings";
import { cn, getError } from "@/lib/utils";

import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";

type BookmarkSettingsFormProps = React.ComponentProps<"div">;

export function BookmarkSettingsForm({ className, ...props }: BookmarkSettingsFormProps) {
  const {
    archivedDefault,
    unreadDefault,
    sharedDefault,
    autoMarkRead,
    continueBulkEdit,
    keepBulkSelection,
    setArchivedDefault,
    setUnreadDefault,
    setSharedDefault,
    setAutoMarkRead,
    setContinueBulkEdit,
    setKeepBulkSelection,
  } = useSettingsStore(
    useShallow((state) => ({
      archivedDefault: state.archivedDefault,
      unreadDefault: state.unreadDefault,
      sharedDefault: state.sharedDefault,
      autoMarkRead: state.autoMarkRead,
      continueBulkEdit: state.continueBulkEdit,
      keepBulkSelection: state.keepBulkSelection,
      setArchivedDefault: state.setArchivedDefault,
      setUnreadDefault: state.setUnreadDefault,
      setSharedDefault: state.setSharedDefault,
      setAutoMarkRead: state.setAutoMarkRead,
      setContinueBulkEdit: state.setContinueBulkEdit,
      setKeepBulkSelection: state.setKeepBulkSelection,
    }))
  );

  const form = useForm({
    defaultValues: {
      unreadDefault,
      archivedDefault,
      sharedDefault,
      autoMarkRead,
      continueBulkEdit,
      keepBulkSelection,
    },
    onSubmit: ({ value }) => {
      try {
        setUnreadDefault(value.unreadDefault);
        setArchivedDefault(value.archivedDefault);
        setSharedDefault(value.sharedDefault);
        setAutoMarkRead(value.autoMarkRead);
        setContinueBulkEdit(value.continueBulkEdit);

        setKeepBulkSelection(value.continueBulkEdit ? value.keepBulkSelection : false);

        toast.success("Settings updated!");
      } catch (error: unknown) {
        const { message } = getError(error);
        toast.error(message);
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
        <FieldSet>
          <FieldLegend className="text-muted-foreground">New bookmark defaults</FieldLegend>
          <FieldGroup>
            <form.Field
              name="archivedDefault"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="archivedDefault">Archived</FieldLabel>
                    <FieldDescription>Set new bookmarks as archived by default.</FieldDescription>
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
                    <FieldDescription>Set new bookmarks as unread by default.</FieldDescription>
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
                    <FieldDescription>Set new bookmarks as shared by default.</FieldDescription>
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
          </FieldGroup>
        </FieldSet>

        <FieldSeparator className="my-4" />

        <FieldSet>
          <FieldLegend className="text-muted-foreground">Interactions</FieldLegend>
          <FieldGroup>
            <form.Field
              name="autoMarkRead"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="autoMarkRead">Auto-mark as read</FieldLabel>
                    <FieldDescription>
                      Automatically mark bookmarks as read after viewing.
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

            <form.Field
              name="continueBulkEdit"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="continueBulkEdit">Continue bulk edit</FieldLabel>
                    <FieldDescription>
                      Remain in bulk edit mode after performing an action.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="continueBulkEdit"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onCheckedChange={(checked) => field.handleChange(checked)}
                  />
                </Field>
              )}
            />

            <form.Subscribe selector={(state) => state.values.continueBulkEdit}>
              {(continueBulkEditAfterAction) => (
                <form.Field
                  name="keepBulkSelection"
                  children={(field) => (
                    <Field orientation="horizontal" data-disabled={!continueBulkEditAfterAction}>
                      <FieldContent>
                        <FieldLabel htmlFor="keepBulkSelection">Keep bulk selection</FieldLabel>
                        <FieldDescription>
                          Retain selected items after performing a bulk edit action.
                        </FieldDescription>
                      </FieldContent>
                      <Switch
                        id="keepBulkSelection"
                        checked={field.state.value}
                        disabled={!continueBulkEditAfterAction}
                        onBlur={field.handleBlur}
                        onCheckedChange={(checked) => field.handleChange(checked)}
                      />
                    </Field>
                  )}
                />
              )}
            </form.Subscribe>
          </FieldGroup>
        </FieldSet>

        <FieldGroup className="mt-8">
          <Button className="text-foreground cursor-pointer" type="submit">
            Update
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
