import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { UrlSchema, useSettingsStore } from "@/lib/store";
import { cn, getErrorMessage } from "@/lib/utils";

import CustomFieldError from "@/components/forms/custom-field-error";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type UserSettingsFormProps = React.ComponentProps<"div">;

export function UserSettingsForm({ className, ...props }: UserSettingsFormProps) {
  const { username, linkdingUrl, setUsername, setLinkdingUrl } = useSettingsStore(
    useShallow((state) => ({
      username: state.username,
      linkdingUrl: state.linkdingUrl,
      setUsername: state.setUsername,
      setLinkdingUrl: state.setLinkdingUrl,
    }))
  );

  const form = useForm({
    defaultValues: {
      username,
      linkdingUrl,
    },
    onSubmit: ({ value }) => {
      try {
        setUsername(value.username);
        setLinkdingUrl(value.linkdingUrl);

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
          <FieldLegend className="text-muted-foreground">Account</FieldLegend>
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

        <FieldGroup className="mt-8">
          <Button className="text-foreground cursor-pointer" type="submit">
            Update
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
