import z from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { DefaultSortDate, Theme, View } from "@/types";

export const UrlSchema = z
  .url({ error: "Url is not valid." })
  .min(1, { error: "Url is required." });

export type Url = z.infer<typeof UrlSchema>;

type SettingsStoreState = {
  username: string;
  linkdingUrl: Url;
  view: View;
  theme: Theme;
  sidebarAddCollapsed: boolean;
  defaultSortDate: DefaultSortDate;
  limit: number;
  continueBulkEdit: boolean;
  keepBulkSelection: boolean;
  archivedDefault: boolean;
  unreadDefault: boolean;
  sharedDefault: boolean;
  autoMarkRead: boolean;
  isSetupComplete: boolean;
};

type SettingsStoreActions = {
  setUsername: (username: string) => void;
  setLinkdingUrl: (linkdingUrl: Url) => void;
  setView: (view: View) => void;
  setTheme: (theme: Theme) => void;
  setSidebarAddCollapsed: (sidebarAddCollapsed: boolean) => void;
  setDefaultSortDate: (defaultSortDate: DefaultSortDate) => void;
  setLimit: (limit: number) => void;
  setContinueBulkEdit: (continueBulkEdit: boolean) => void;
  setKeepBulkSelection: (keepBulkSelection: boolean) => void;
  setArchivedDefault: (archivedDefault: boolean) => void;
  setUnreadDefault: (unreadDefault: boolean) => void;
  setSharedDefault: (sharedDefault: boolean) => void;
  setAutoMarkRead: (autoMarkRead: boolean) => void;
  setIsSetupComplete: (isSetupComplete: boolean) => void;
  reset: () => void;
};

const initialSettingsStoreState: SettingsStoreState = {
  username: import.meta.env.VITE_USER_NAME ?? "User",
  linkdingUrl: import.meta.env.VITE_LINKDING_EXTERNAL_URL ?? "http://localhost:9090",
  view: "grid",
  theme: "system",
  sidebarAddCollapsed: false,
  defaultSortDate: "date_modified",
  limit: 10,
  continueBulkEdit: false,
  keepBulkSelection: false,
  archivedDefault: false,
  unreadDefault: false,
  sharedDefault: false,
  autoMarkRead: true,
  isSetupComplete: false,
};

export const useSettingsStore = create<SettingsStoreState & SettingsStoreActions>()(
  persist(
    (set) => ({
      ...initialSettingsStoreState,
      setUsername: (username) => set({ username }),
      setLinkdingUrl: (linkdingUrl) => set({ linkdingUrl }),
      setView: (view) => set({ view }),
      setTheme: (theme) => set({ theme }),
      setSidebarAddCollapsed: (sidebarAddCollapsed) => set({ sidebarAddCollapsed }),
      setDefaultSortDate: (defaultSortDate) => set({ defaultSortDate }),
      setLimit: (limit) => set({ limit }),
      setContinueBulkEdit: (continueBulkEdit) => set({ continueBulkEdit }),
      setKeepBulkSelection: (keepBulkSelection) => set({ keepBulkSelection }),
      setArchivedDefault: (archivedDefault) => set({ archivedDefault }),
      setUnreadDefault: (unreadDefault) => set({ unreadDefault }),
      setSharedDefault: (sharedDefault) => set({ sharedDefault }),
      setAutoMarkRead: (autoMarkRead) => set({ autoMarkRead }),
      setIsSetupComplete: (isSetupComplete) => set({ isSetupComplete }),
      reset: () => set(initialSettingsStoreState),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export function resetPersistedStorage() {
  useSettingsStore.persist.clearStorage();
  useSettingsStore.getState().reset();
}
