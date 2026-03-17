import { createContext, useContext, useState } from "react";

export type ActiveGlobalDialog = "tag-form" | null;
export type ActiveGlobalDrawer = string | null;

interface GlobalModalContextType {
  activeGlobalDialog: ActiveGlobalDialog;
  activeGlobalDrawer: ActiveGlobalDrawer;
  setActiveGlobalDialog: (dialog: ActiveGlobalDialog) => void;
  setActiveGlobalDrawer: (drawer: ActiveGlobalDrawer) => void;
  closeGlobalDialog: () => void;
  closeGlobalDrawer: () => void;
}

const GlobalModalContext = createContext<GlobalModalContextType | undefined>(undefined);

export function GlobalModalProvider({ children }: { children: React.ReactNode }) {
  const [activeGlobalDialog, setActiveGlobalDialog] = useState<ActiveGlobalDialog>(null);
  const [activeGlobalDrawer, setActiveGlobalDrawer] = useState<ActiveGlobalDrawer>(null);

  function closeGlobalDialog() {
    setActiveGlobalDialog(null);
  }

  function closeGlobalDrawer() {
    setActiveGlobalDrawer(null);
  }

  return (
    <GlobalModalContext.Provider
      value={{
        activeGlobalDialog,
        activeGlobalDrawer,
        setActiveGlobalDialog,
        setActiveGlobalDrawer,
        closeGlobalDialog,
        closeGlobalDrawer,
      }}>
      {children}
    </GlobalModalContext.Provider>
  );
}

export function useGlobalModal() {
  const context = useContext(GlobalModalContext);
  if (context === undefined) {
    throw new Error("useGlobalModal must be used within a GlobalModalProvider");
  }
  return context;
}
