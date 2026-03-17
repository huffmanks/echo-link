import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

import { useCreateTag } from "@/lib/mutations";
import { getAllQueryOptions } from "@/lib/queries";
import { useGlobalModal } from "@/providers/global-modal-context";

import CustomFieldError from "@/components/forms/custom-field-error";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function CreateTagForm() {
  const { mutateAsync, isPending } = useCreateTag();
  const { closeGlobalDialog } = useGlobalModal();
  const { data } = useSuspenseQuery(getAllQueryOptions.tags);

  const form = useForm({
    defaultValues: {
      name: "",
    },
    onSubmit: async ({ value }) => {
      const result = await mutateAsync(value);

      if ("offline" in result && result.offline) {
        toast.info("Added to queue. Will be created once connection is restored.");
      } else {
        toast.success("Tag created.");
      }

      form.reset();
      closeGlobalDialog();
    },
  });

  return (
    <>
      <DialogHeader className="px-4">
        <DialogTitle>Add tag</DialogTitle>
        <DialogDescription>Create a new tag.</DialogDescription>
      </DialogHeader>
      <div className="scrollbar overflow-y-auto px-4 pt-2 pb-6 sm:pt-0 sm:pb-4">
        <div className="flex flex-col gap-6">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await form.handleSubmit();
            }}>
            <FieldGroup>
              <form.Field
                name="name"
                validators={{
                  onChange: z
                    .string()
                    .min(1, "Name is required.")
                    .refine(
                      (val) =>
                        !data?.results.some((tag) => tag.name.toLowerCase() === val.toLowerCase()),
                      { message: "A tag with this name already exists." }
                    ),
                }}
                children={(field) => (
                  <Field data-invalid={!field.state.meta.isValid}>
                    <FieldLabel htmlFor="name">Name</FieldLabel>
                    <Input
                      id="name"
                      type="text"
                      value={field.state.value}
                      aria-invalid={!field.state.meta.isValid}
                      onBlur={field.handleBlur}
                      onFocus={(e) => {
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 150);
                      }}
                      onChange={(e) => {
                        const val = e.target.value || "";
                        const formattedValue = val.toLowerCase().replace(/\s+/g, "-");
                        field.handleChange(formattedValue);
                      }}
                    />
                    <FieldDescription>
                      Tag names are case-insensitive and cannot contain spaces (spaces will be
                      replaced with hyphens).
                    </FieldDescription>
                    {!field.state.meta.isValid && (
                      <CustomFieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              />

              <DialogFooter>
                <DialogClose
                  render={
                    <Button type="button" variant="outline" className="cursor-pointer">
                      Cancel
                    </Button>
                  }></DialogClose>
                <Button
                  className="text-foreground cursor-pointer"
                  type="submit"
                  disabled={isPending}>
                  {isPending ? "Saving..." : "Create"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </div>
      </div>
    </>
  );
}
