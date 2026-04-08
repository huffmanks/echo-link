import { create } from "zustand";

export type BulkAction =
  | "read"
  | "unread"
  | "share"
  | "unshare"
  | "archive"
  | "unarchive"
  | "delete";

type BulkSelectionStoreState = {
  isBulkSelecting: boolean;
  selectedIds: Set<number>;
  bulkAction: BulkAction | null;
};

type BulkSelectionStoreActions = {
  toggleBulkSelection: () => void;
  toggleIdSelection: (id: number) => void;
  selectAll: (allIds: Array<number>) => void;
  clearSelection: () => void;
  stopBulkSelection: () => void;
  setCurrentBulkAction: (action: BulkAction | null) => void;
};

const initialBulkSelectionStoreState: BulkSelectionStoreState = {
  isBulkSelecting: false,
  selectedIds: new Set(),
  bulkAction: null,
};

export const useBulkSelectionStore = create<BulkSelectionStoreState & BulkSelectionStoreActions>()(
  (set) => ({
    ...initialBulkSelectionStoreState,
    clearSelection: () => set({ selectedIds: new Set(), bulkAction: null }),
    stopBulkSelection: () =>
      set({ isBulkSelecting: false, selectedIds: new Set(), bulkAction: null }),
    toggleBulkSelection: () =>
      set((state) => {
        const nextIsSelecting = !state.isBulkSelecting;
        return {
          isBulkSelecting: nextIsSelecting,
          ...(nextIsSelecting ? {} : { selectedIds: new Set(), bulkAction: null }),
        };
      }),
    toggleIdSelection: (id: number) =>
      set((state) => {
        const nextSet = new Set(state.selectedIds);
        if (nextSet.has(id)) {
          nextSet.delete(id);
        } else {
          nextSet.add(id);
        }
        return { selectedIds: nextSet };
      }),
    selectAll: (allIds: Array<number>) => set({ selectedIds: new Set(allIds) }),
    setCurrentBulkAction: (action: BulkAction | null) => set({ bulkAction: action }),
  })
);
