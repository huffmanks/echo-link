import { useState } from "react";

import { GlobalModalContext } from "@/context/global-modal";
import type { ActiveGlobalDialog, ActiveGlobalDrawer } from "@/context/global-modal";

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
