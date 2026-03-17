import { createContext, useCallback, useContext, useState } from "react";

export type BulkAction =
  | "read"
  | "unread"
  | "share"
  | "unshare"
  | "archive"
  | "unarchive"
  | "delete";

interface BulkSelectionContextType {
  isBulkSelecting: boolean;
  selectedIds: Set<number>;
  bulkAction: BulkAction | null;
  toggleBulkSelection: () => void;
  toggleIdSelection: (id: number) => void;
  selectAll: (allIds: Array<number>) => void;
  clearSelection: () => void;
  stopBulkSelection: () => void;
  setCurrentBulkAction: (action: BulkAction | null) => void;
}

const BulkSelectionContext = createContext<BulkSelectionContextType | undefined>(undefined);

export function BulkSelectionProvider({ children }: { children: React.ReactNode }) {
  const [isBulkSelecting, setIsBulkSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBulkAction(null);
  }, []);

  const stopBulkSelection = useCallback(() => {
    setIsBulkSelecting(false);
    clearSelection();
  }, []);

  const toggleBulkSelection = useCallback(() => {
    setIsBulkSelecting((prev) => {
      if (prev) clearSelection();
      return !prev;
    });
  }, [clearSelection]);

  const toggleIdSelection = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id);
      return nextSet;
    });
  }, []);

  const selectAll = useCallback((allIds: Array<number>) => {
    setSelectedIds(new Set(allIds));
  }, []);

  const setCurrentBulkAction = useCallback((action: BulkAction | null) => {
    setBulkAction(action);
  }, []);

  return (
    <BulkSelectionContext.Provider
      value={{
        isBulkSelecting,
        selectedIds,
        bulkAction,
        toggleBulkSelection,
        toggleIdSelection,
        selectAll,
        clearSelection,
        stopBulkSelection,
        setCurrentBulkAction,
      }}>
      {children}
    </BulkSelectionContext.Provider>
  );
}

export function useBulkSelection() {
  const context = useContext(BulkSelectionContext);
  if (context === undefined) {
    throw new Error("useBulkSelection must be used within a BulkSelectionProvider");
  }
  return context;
}
