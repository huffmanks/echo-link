import { useContext } from "react";

import { BackgroundSyncContext } from "@/providers/background-sync";

export function useBackgroundSync() {
  const context = useContext(BackgroundSyncContext);
  if (!context) throw new Error("useBackgroundSync must be used within BackgroundSyncProvider");
  return context;
}
