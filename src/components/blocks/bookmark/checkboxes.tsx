import { useBulkSelection } from "@/providers/bulk-selection";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function ItemCheckbox({ id }: { id: number }) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelection();

  const isChecked = selectedIds.has(id);

  if (!isBulkSelecting) return null;

  return (
    <Checkbox
      className="pointer-events-auto cursor-pointer"
      checked={isChecked}
      onCheckedChange={() => toggleIdSelection(id)}
    />
  );
}

export function AllCheckbox({
  allIds,
  showLabel = false,
}: {
  allIds: number[];
  showLabel?: boolean;
}) {
  const { isBulkSelecting, selectedIds, selectAll, clearSelection } = useBulkSelection();

  const isAllSelected = allIds.length > 0 && selectedIds.size === allIds.length;
  const isAnySelected = selectedIds.size > 0 && !isAllSelected;

  function handleHeaderChange(checked: boolean) {
    if (checked) {
      selectAll(allIds);
    } else {
      clearSelection();
    }
  }

  if (!isBulkSelecting) return null;

  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <Checkbox
        className="pointer-events-auto cursor-pointer"
        checked={isAllSelected}
        indeterminate={isAnySelected}
        onCheckedChange={handleHeaderChange}
      />
      {showLabel && <Label className="">Select all</Label>}
    </div>
  );
}
