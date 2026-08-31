import { useForm } from "@tanstack/react-form";
import { LaptopIcon, LayoutGridIcon, ListIcon, MoonIcon, SunIcon, Table2Icon } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useSettingsStore } from "@/lib/store/settings";
import { cn, getErrorMessage } from "@/lib/utils";
import type { DefaultSortType, Theme, View } from "@/types";

import CustomFieldError from "@/components/forms/custom-field-error";
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

type UiSettingsFormProps = React.ComponentProps<"div">;

export function UiSettingsForm({ className, ...props }: UiSettingsFormProps) {
  const {
    view,
    theme,
    sidebarAddCollapsed,
    defaultSortType,
    limit,
    showIdColumn,
    setView,
    setTheme,
    setSidebarAddCollapsed,
    setDefaultSortType,
    setLimit,
    setShowIdColumn,
  } = useSettingsStore(
    useShallow((state) => ({
      view: state.view,
      theme: state.theme,
      sidebarAddCollapsed: state.sidebarAddCollapsed,
      defaultSortType: state.defaultSortType,
      limit: state.limit,
      showIdColumn: state.showIdColumn,
      setView: state.setView,
      setTheme: state.setTheme,
      setSidebarAddCollapsed: state.setSidebarAddCollapsed,
      setDefaultSortType: state.setDefaultSortType,
      setLimit: state.setLimit,
      setShowIdColumn: state.setShowIdColumn,
    }))
  );

  const form = useForm({
    defaultValues: {
      view,
      theme,
      sidebarAddCollapsed,
      defaultSortType,
      limit,
      showIdColumn,
    },
    onSubmit: ({ value }) => {
      try {
        setView(value.view);
        setTheme(value.theme);
        setSidebarAddCollapsed(value.sidebarAddCollapsed);
        setDefaultSortType(value.defaultSortType);
        setLimit(Number(value.limit));
        setShowIdColumn(value.showIdColumn);

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
          <FieldLegend className="text-muted-foreground">Appearance</FieldLegend>
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
                  <FieldLabel htmlFor="view">Layout</FieldLabel>
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
          </FieldGroup>
        </FieldSet>

        <FieldSeparator className="my-4" />

        <FieldSet>
          <FieldLegend className="text-muted-foreground">Results</FieldLegend>
          <FieldGroup>
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
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={field.state.value === 0 ? "" : field.state.value}
                    aria-invalid={!field.state.meta.isValid}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.handleChange(val === "" ? 0 : Number(val));
                    }}
                  />
                  {!field.state.meta.isValid && field.state.value !== 0 && (
                    <CustomFieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />

            <form.Field
              name="defaultSortType"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="defaultSortType">Default sort type</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(val) => field.handleChange(val as DefaultSortType)}>
                    <SelectTrigger id="defaultSortType">
                      <SelectValue>
                        {field.state.value === "date_added" ? (
                          <span className="normal-case">Date created</span>
                        ) : field.state.value === "date_modified" ? (
                          <span className="normal-case">Date updated</span>
                        ) : (
                          <span className="normal-case">Title</span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="date_added">Date created</SelectItem>
                        <SelectItem value="date_modified">Date updated</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <form.Field
              name="showIdColumn"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="showIdColumn">Show ID column</FieldLabel>
                    <FieldDescription>
                      Toggle whether the ID column is visible in table views.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="showIdColumn"
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
          <FieldLegend className="text-muted-foreground">Sidebar</FieldLegend>
          <FieldGroup>
            <form.Field
              name="sidebarAddCollapsed"
              children={(field) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="sidebarAddCollapsed">Collapse “Add” by default</FieldLabel>
                    <FieldDescription>
                      Sets whether the “Add” section in the sidebar is collapsed by default (desktop
                      only).
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    id="sidebarAddCollapsed"
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
