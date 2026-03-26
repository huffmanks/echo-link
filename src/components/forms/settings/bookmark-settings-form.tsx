import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store";
import { cn, getErrorMessage } from "@/lib/utils";

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
    exitBulkEditOnAction,
    setArchivedDefault,
    setUnreadDefault,
    setSharedDefault,
    setAutoMarkRead,
    setExitBulkEditOnAction,
  } = useSettingsStore(
    useShallow((state) => ({
      archivedDefault: state.archivedDefault,
      unreadDefault: state.unreadDefault,
      sharedDefault: state.sharedDefault,
      autoMarkRead: state.autoMarkRead,
      exitBulkEditOnAction: state.exitBulkEditOnAction,
      setArchivedDefault: state.setArchivedDefault,
      setUnreadDefault: state.setUnreadDefault,
      setSharedDefault: state.setSharedDefault,
      setAutoMarkRead: state.setAutoMarkRead,
      setExitBulkEditOnAction: state.setExitBulkEditOnAction,
    }))
  );

  const form = useForm({
    defaultValues: {
      unreadDefault,
      archivedDefault,
      sharedDefault,
      autoMarkRead,
      exitBulkEditOnAction,
    },
    onSubmit: ({ value }) => {
      try {
        setUnreadDefault(value.unreadDefault);
        setArchivedDefault(value.archivedDefault);
        setSharedDefault(value.sharedDefault);
        setAutoMarkRead(value.autoMarkRead);
        setExitBulkEditOnAction(value.exitBulkEditOnAction);

        toast.success("Settings updated!");
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
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
              name="exitBulkEditOnAction"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="exitBulkEditOnAction">Exit bulk edit on action</FieldLabel>
                    <FieldDescription>
                      Automatically exit bulk editing after running an action.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="exitBulkEditOnAction"
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
      </form>
    </div>
  );
}
