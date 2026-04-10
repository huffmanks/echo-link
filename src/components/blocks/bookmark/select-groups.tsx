import {
  ARCHIVE_BULK_SELECT_OPTIONS,
  DELETE_BULK_SELECT_OPTIONS,
  READ_BULK_SELECT_OPTIONS,
  SHARE_BULK_SELECT_OPTIONS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { EntityName, SelectOption } from "@/types";

import {
  SelectGroup as SelectGroupBase,
  SelectItem,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

export default function SelectGroups({ entityName }: { entityName: EntityName }) {
  return (
    <>
      {entityName === "bookmark" && (
        <SelectGroup label="Mark as read/unread" selectOptions={READ_BULK_SELECT_OPTIONS} />
      )}
      {entityName === "bookmark" && (
        <SelectGroup label="Share/Unshare" selectOptions={SHARE_BULK_SELECT_OPTIONS} />
      )}
      {entityName === "bookmark" && (
        <SelectGroup label="Archive/Unarchive" selectOptions={ARCHIVE_BULK_SELECT_OPTIONS} />
      )}

      <SelectGroup label="Delete" selectOptions={DELETE_BULK_SELECT_OPTIONS} />
    </>
  );
}

function SelectGroup({
  label,
  selectOptions,
}: {
  label: string;
  selectOptions: Array<SelectOption>;
}) {
  const isDelete = label === "Delete";
  return (
    <>
      <SelectGroupBase>
        <SelectLabel className="sr-only">{label}</SelectLabel>
        {selectOptions.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className={cn("cursor-pointer", isDelete && "text-destructive")}>
            {item.label}
          </SelectItem>
        ))}
      </SelectGroupBase>
      {!isDelete && <SelectSeparator />}
    </>
  );
}
