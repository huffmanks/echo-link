import { useState } from "react";

import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";
import { useShallow } from "zustand/react/shallow";

import { verifyUrlHealth } from "@/lib/api";
import { handleSetup, validate } from "@/lib/auth";
import { UrlSchema, useSettingsStore } from "@/lib/store/settings";
import { cn, getErrorMessage, joinUrlPath } from "@/lib/utils";

import CustomFieldError from "@/components/forms/custom-field-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type SetupFormProps = React.ComponentProps<"div">;

export function SetupForm({ className, ...props }: SetupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string | null>("");
  const navigate = useNavigate();

  const { username, linkdingUrl, limit } = useSettingsStore(
    useShallow((state) => ({
      username: state.username,
      linkdingUrl: state.linkdingUrl,
      limit: state.limit,
    }))
  );

  const config = (window as any).RUNTIME_CONFIG;
  const isDev = import.meta.env.DEV;

  const form = useForm({
    defaultValues: {
      username: isDev ? username : config?.ECHOLINK_USER_NAME || username,
      linkdingUrl: isDev ? linkdingUrl : config?.LINKDING_EXTERNAL_URL || linkdingUrl,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setTokenErrorMessage(null);

      try {
        const { isValid, status } = await validate({ force: true });

        if ((!isValid && status === 401) || status === 403) {
          setTokenErrorMessage(
            "API token is invalid or missing. Provide a valid token in your .env to continue."
          );
          return;
        }

        const result = await verifyUrlHealth(value.linkdingUrl);

        if (!result.reachable) {
          toast.error("Unable to connect. Please verify the URL.");
          return;
        }

        if (result.warning) {
          toast.warning(result.message || "Saved localhost URL without verification.");
        }

        handleSetup({ ...value });

        navigate({ to: "/dashboard", search: { limit } });
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        setTokenErrorMessage(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="mb-2 flex items-center gap-3">
            <svg
              className="fill-primary size-10"
              xmlns="http://www.w3.org/2000/svg"
              width="512"
              height="512"
              viewBox="0 0 512 512">
              <circle cx="256" cy="256" r="256" />
              <g fill="#fff" transform="translate(25.6, 25.6) scale(0.9) scale(21.3333)">
                <path d="m5.251 9.663l-1.587-1.41a1 1 0 1 0-1.328 1.494l1.405 1.25l.068-.062c.503-.446.982-.873 1.442-1.272m2.295 4.642q.544.436 1.04.777c1.117.763 2.185 1.228 3.414 1.228s2.297-.465 3.413-1.228c1.081-.739 2.306-1.828 3.843-3.194l.052-.046l2.356-2.095a1 1 0 0 0-1.328-1.494l-2.357 2.094c-1.6 1.423-2.731 2.426-3.694 3.084c-.94.642-1.613.88-2.285.88s-1.345-.238-2.285-.88q-.304-.21-.636-.465c-.446.378-.949.82-1.533 1.339" />
                <path d="M16.455 9.695q-.545-.436-1.042-.777C14.297 8.155 13.23 7.689 12 7.689s-2.297.466-3.413 1.229c-1.081.738-2.306 1.828-3.843 3.193l-.052.047l-2.356 2.094a1 1 0 1 0 1.328 1.495l2.357-2.094c1.6-1.423 2.731-2.426 3.694-3.084c.94-.642 1.613-.88 2.285-.88s1.345.238 2.285.88q.304.21.636.464c.446-.377.949-.82 1.534-1.338m3.804 3.308l-.068.061q-.753.672-1.442 1.273l1.587 1.41a1 1 0 0 0 1.328-1.495z" />
              </g>
            </svg>
            <h1>EchoLink setup</h1>
          </CardTitle>
          <CardDescription>Enter your Linkding connection settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            autoComplete="off"
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await form.handleSubmit();
            }}>
            <FieldGroup>
              <form.Field
                name="username"
                validators={{
                  onBlur: z.string().min(1, "Name is required."),
                }}
                children={(field) => (
                  <Field data-invalid={!field.state.meta.isValid}>
                    <FieldLabel htmlFor="username">Name</FieldLabel>
                    <Input
                      id="username"
                      type="text"
                      autoComplete="off"
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
                    <FieldLabel htmlFor="linkdingUrl">Linkding external URL</FieldLabel>
                    <Input
                      id="linkdingUrl"
                      type="text"
                      autoComplete="off"
                      value={field.state.value}
                      aria-invalid={!field.state.meta.isValid}
                      placeholder="http://localhost:9090"
                      onBlur={field.handleBlur}
                      onChange={(e) => {
                        if (tokenErrorMessage) setTokenErrorMessage(null);
                        field.handleChange(e.target.value);
                      }}
                    />
                    {!field.state.meta.isValid && (
                      <CustomFieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              />

              {tokenErrorMessage && (
                <div>
                  <h2 className="text-destructive font-medium">LINKDING_API_TOKEN</h2>
                  <p className="text-sm">
                    <span>{tokenErrorMessage}</span>
                    <span> </span>
                    <form.Subscribe selector={(state) => state.values.linkdingUrl}>
                      {(linkdingUrlInput) => (
                        <a
                          href={joinUrlPath(linkdingUrlInput, "/settings/integrations")}
                          className="text-primary text-sm underline-offset-4 outline-none focus-within:underline hover:underline"
                          target="_blank"
                          rel="noopener noreferrer">
                          Need an API token?
                        </a>
                      )}
                    </form.Subscribe>
                  </p>
                </div>
              )}

              <Field>
                <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                  Finish
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
