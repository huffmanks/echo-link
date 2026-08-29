import { createContext, useContext } from "react";

export type ActiveGlobalDialog = "tag-form" | null;
export type ActiveGlobalDrawer = string | null;

export interface GlobalModalContextType {
  activeGlobalDialog: ActiveGlobalDialog;
  activeGlobalDrawer: ActiveGlobalDrawer;
  setActiveGlobalDialog: (dialog: ActiveGlobalDialog) => void;
  setActiveGlobalDrawer: (drawer: ActiveGlobalDrawer) => void;
  closeGlobalDialog: () => void;
  closeGlobalDrawer: () => void;
}

export const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function useGlobalModal() {
  const context = useContext(GlobalModalContext);
  if (context === undefined) {
    throw new Error("useGlobalModal must be used within a GlobalModalProvider");
  }
  return context;
}
