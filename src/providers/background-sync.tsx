import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { toast } from "sonner";

import { BackgroundSyncContext } from "@/context/background-sync";
import { linkdingFetch } from "@/lib/api";
import { db } from "@/lib/db";
import type { CacheName } from "@/types";

export function BackgroundSyncProvider({ children }: { children: React.ReactNode }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const queryClient = useQueryClient();

  const clientIdRef = useRef<string | null>(null);
  if (!clientIdRef.current) clientIdRef.current = nanoid();

  const isOnlineRef = useRef(isOnline);
  const isConnectedRef = useRef(isConnected);

  const isInitializedRef = useRef(false);

  function purgeAssets(cacheName: CacheName) {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "PURGE_CACHE",
        cacheName,
      });
    }
  }

  const checkApiHealth = useCallback(async () => {
    const currentOnline = navigator.onLine;
    const prevOnline = isOnlineRef.current;
    const prevConnected = isConnectedRef.current;
    const isInitial = !isInitializedRef.current;

    let toastedThisCheck = false;

    if (currentOnline !== prevOnline) {
      isOnlineRef.current = currentOnline;
      setIsOnline(currentOnline);

      if (!isInitial) {
        if (currentOnline) {
          toast.success("Back online", { description: "Internet connection restored." });
        } else {
          toast.error("Offline mode", { description: "No internet connection." });
        }
        toastedThisCheck = true;
      }
    }

    if (!currentOnline) {
      if (prevConnected) {
        isConnectedRef.current = false;
        setIsConnected(false);
      }
      isInitializedRef.current = true;
      return false;
    }

    try {
      await linkdingFetch("bookmarks", { params: { limit: "1" } });

      if (!prevConnected) {
        isConnectedRef.current = true;
        setIsConnected(true);

        if (!isInitial && !toastedThisCheck) {
          toast.success("API Connected", { description: "Connected to Linkding instance." });
        }
      }
      isInitializedRef.current = true;
      return true;
    } catch {
      if (prevConnected) {
        isConnectedRef.current = false;
        setIsConnected(false);

        if (!isInitial && !toastedThisCheck) {
          toast.error("API Unreachable", { description: "Cannot connect to Linkding instance." });
        }
      }
      isInitializedRef.current = true;
      return false;
    }
  }, []);

  useEffect(() => {
    checkApiHealth();

    const handleNetworkChange = () => checkApiHealth();

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
    window.addEventListener("focus", handleNetworkChange);

    const intervalId = setInterval(checkApiHealth, 30_000);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      window.removeEventListener("focus", handleNetworkChange);
      clearInterval(intervalId);
    };
  }, [checkApiHealth]);

  useEffect(() => {
    async function flushOutbox() {
      if (!isConnected || isSyncing) return;

      setIsSyncing(true);

      try {
        const LOCK_TIMEOUT = 1000 * 60 * 5;
        const MAX_BATCH = 10;
        const clientId = clientIdRef.current!;

        let claimed: Array<any> = [];
        await db.transaction("rw", db.outbox, async () => {
          const all = await db.outbox.orderBy("timestamp").toArray();
          const now = Date.now();
          for (const item of all) {
            if (claimed.length >= MAX_BATCH) break;

            const lockedAt = item.lockedAt ?? 0;
            const isStale = lockedAt > 0 && now - lockedAt > LOCK_TIMEOUT;
            const isUnlocked = !item.lockedAt || item.lockedBy === null;

            if (isUnlocked || isStale) {
              if (!item.id) continue;
              await db.outbox.update(item.id, { lockedBy: clientId, lockedAt: now });
              claimed.push({ ...item, lockedBy: clientId, lockedAt: now });
            }
          }
        });

        if (claimed.length === 0) {
          return;
        }

        let anySucceeded = false;
        for (const item of claimed) {
          try {
            const res = await linkdingFetch(item.resourcePath, {
              method: item.method,
              body: JSON.stringify(item.body),
            });

            if (item.id) await db.outbox.delete(item.id);
            anySucceeded = true;

            try {
              const mergeIntoCache = async () => {
                const replaceInQuery = (
                  queryKey: string[],
                  matcher: (it: any) => boolean,
                  replacement: any
                ) => {
                  queryClient.setQueriesData({ queryKey, exact: false }, (old: any) => {
                    if (!old) return old;
                    if (Array.isArray(old)) {
                      return old.map((it) => (matcher(it) ? replacement : it));
                    }

                    return {
                      ...old,
                      results: old.results?.map((it: any) => (matcher(it) ? replacement : it)),
                    };
                  });
                };

                const body = item.body || {};

                if (item.resourcePath.startsWith("bookmarks")) {
                  const server = res as any;

                  if (body.url) {
                    replaceInQuery(
                      ["bookmarks"],
                      (it) =>
                        String(it.url) === String(body.url) &&
                        (it._isPending || String(it.id).startsWith("temp-")),
                      server
                    );
                    return;
                  }

                  if (body.id) {
                    replaceInQuery(
                      ["bookmarks"],
                      (it) => String(it.id) === String(body.id),
                      server
                    );
                    return;
                  }
                }

                if (item.resourcePath.startsWith("bundles")) {
                  const server = res as any;
                  if (body.name) {
                    replaceInQuery(
                      ["bundles"],
                      (it) =>
                        String(it.name) === String(body.name) &&
                        (it._isPending || String(it.id).startsWith("temp-")),
                      server
                    );
                    return;
                  }
                  if (body.id) {
                    replaceInQuery(["bundles"], (it) => String(it.id) === String(body.id), server);
                    return;
                  }
                }

                if (item.resourcePath.startsWith("tags")) {
                  const server = res as any;
                  if (body.name) {
                    replaceInQuery(
                      ["tags"],
                      (it) =>
                        String(it.name) === String(body.name) &&
                        (it._isPending || String(it.id).startsWith("temp-")),
                      server
                    );
                    return;
                  }
                  if (body.id) {
                    replaceInQuery(["tags"], (it) => String(it.id) === String(body.id), server);
                    return;
                  }
                }

                queryClient.invalidateQueries();
              };

              await mergeIntoCache();
            } catch (e) {
              try {
                queryClient.invalidateQueries();
              } catch {}
            }

            try {
              purgeAssets("linkding-api-cache");
            } catch (e) {}
          } catch (error) {
            isConnectedRef.current = false;
            setIsConnected(false);

            try {
              if (item.id) {
                await db.outbox.update(item.id, {
                  attempts: (item.attempts || 0) + 1,
                  lockedBy: null,
                  lockedAt: null,
                });
              }
            } catch (e) {}

            toast.error("Syncing failed for an item", {
              description: String((error as any)?.message || error),
            });

            break;
          }
        }

        if (anySucceeded) {
          toast.success("Offline changes synced successfully!");
        }
      } catch (err) {
        isConnectedRef.current = false;
        setIsConnected(false);

        try {
          toast.error("Background sync failed", {
            description: String((err as any)?.message || err),
          });
        } catch {}
      } finally {
        setIsSyncing(false);
        queryClient.invalidateQueries();
      }
    }

    flushOutbox();
  }, [queryClient, isConnected]);

  return (
    <BackgroundSyncContext.Provider value={{ isSyncing, isOnline, isConnected, purgeAssets }}>
      {children}
    </BackgroundSyncContext.Provider>
  );
}
