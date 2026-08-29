import { useState } from "react";

import {
  type ActiveGlobalDialog,
  type ActiveGlobalDrawer,
  GlobalModalContext,
} from "@/context/global-modal";

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
