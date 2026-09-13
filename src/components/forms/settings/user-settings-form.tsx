import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { validate } from "@/lib/auth";
import { UrlSchema, useSettingsStore } from "@/lib/store/settings";
import { cn, getErrorMessage } from "@/lib/utils";

import CustomFieldError from "@/components/forms/custom-field-error";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type UserSettingsFormProps = React.ComponentProps<"div">;

export function UserSettingsForm({ className, ...props }: UserSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);

      try {
        const urlChanged = value.linkdingUrl !== linkdingUrl;
        setUsername(value.username);

        if (urlChanged) {
          const previousUrl = linkdingUrl;
          setLinkdingUrl(value.linkdingUrl);

          const { isValid, errorMessage } = await validate({ force: true });

          if (!isValid) {
            setLinkdingUrl(previousUrl);
            toast.error(errorMessage || "Failed to connect to the new Linkding URL.");
            return;
          }
        }

        toast.success("Settings updated!");
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
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
          <Button className="text-foreground cursor-pointer" type="submit" disabled={isSubmitting}>
            Update
          </Button>
        </FieldGroup>
      </form>
    </div>
  );
}
