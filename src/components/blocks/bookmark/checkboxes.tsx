import { useShallow } from "zustand/react/shallow";

import { useBulkSelectionStore } from "@/lib/bulk-selection-store";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function ItemCheckbox({ id }: { id: number }) {
  const { isBulkSelecting, selectedIds, toggleIdSelection } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      selectedIds: state.selectedIds,
      toggleIdSelection: state.toggleIdSelection,
    }))
  );

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
  allIds: Array<number>;
  showLabel?: boolean;
}) {
  const { isBulkSelecting, selectedIds, selectAll, clearSelection } = useBulkSelectionStore(
    useShallow((state) => ({
      isBulkSelecting: state.isBulkSelecting,
      selectedIds: state.selectedIds,
      selectAll: state.selectAll,
      clearSelection: state.clearSelection,
    }))
  );

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
