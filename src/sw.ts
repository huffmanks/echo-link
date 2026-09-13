import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";

const DEFAULT_TTL = 60 * 60 * 24 * 7;

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: any;
  __WB_DISABLE_DEV_LOGS: boolean;
};

self.__WB_DISABLE_DEV_LOGS = true;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "PURGE_CACHE") {
    event.waitUntil(caches.delete(event.data.cacheName));
  }
});

const navigationRoute = new NavigationRoute(createHandlerBoundToURL("/index.html"), {
  denylist: [/^\/assets\/.*\.html$/],
});

registerRoute(navigationRoute);

registerRoute(
  ({ url }) => /^\/(assets|favicons|media|previews|static)/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "linkding-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 5000,
        maxAgeSeconds: DEFAULT_TTL,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) => url.pathname.startsWith("/api") && request.method === "GET",
  new NetworkFirst({
    cacheName: "linkding-api-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 1000,
        maxAgeSeconds: DEFAULT_TTL,
        purgeOnQuotaError: true,
      }),
      {
        handlerDidError: async ({ request }) => {
          const cacheResponse = await caches.match(request);
          if (cacheResponse) {
            return cacheResponse;
          }

          return new Response(JSON.stringify({ offline: true, error: "API Unreachable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/app-assets"),
  new StaleWhileRevalidate({
    cacheName: "app-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 500,
        maxAgeSeconds: DEFAULT_TTL,
        purgeOnQuotaError: true,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith("/api") && ["POST", "PUT", "PATCH", "DELETE"].includes(request.method),
  new NetworkOnly()
);
