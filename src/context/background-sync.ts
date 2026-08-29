import { createContext, useContext } from "react";

import type { CacheName } from "@/types";

export interface BackgroundSyncContextType {
  isSyncing: boolean;
  isOnline: boolean;
  isConnected: boolean;
  purgeAssets: (cacheName: CacheName) => void;
}

export const BackgroundSyncContext = createContext<BackgroundSyncContextType | undefined>(
  undefined
);

export function useBackgroundSync() {
  const context = useContext(BackgroundSyncContext);
  if (!context) throw new Error("useBackgroundSync must be used within BackgroundSyncProvider");
  return context;
}
