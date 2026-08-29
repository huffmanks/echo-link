import { StrictMode } from "react";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

import * as TanStackQueryProvider from "@/integrations/tanstack-query/root-provider.tsx";
import { BackgroundSyncProvider } from "@/providers/background-sync";
import { GlobalModalProvider } from "@/providers/global-modal";
import ThemeWatcher from "@/providers/theme-watcher";
import reportWebVitals from "@/reportWebVitals.ts";
import { routeTree } from "@/routeTree.gen";
import "@/styles.css";

import DefaultErrorComponent from "@/components/default-error-component";
import DefaultNotFoundComponent from "@/components/default-not-found-component";
import GlobalModal from "@/components/global-modal";
import { Toaster } from "@/components/ui/sonner";

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultNotFoundComponent: (props) => <DefaultNotFoundComponent {...props} />,
  defaultErrorComponent: (props) => <DefaultErrorComponent {...props} />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <ThemeWatcher />
        <BackgroundSyncProvider>
          <GlobalModalProvider>
            <RouterProvider router={router} />
            <GlobalModal />
          </GlobalModalProvider>
        </BackgroundSyncProvider>
        <Toaster richColors position={window.innerWidth <= 768 ? "top-center" : "bottom-right"} />
      </TanStackQueryProvider.Provider>
    </StrictMode>
  );
}

reportWebVitals();
