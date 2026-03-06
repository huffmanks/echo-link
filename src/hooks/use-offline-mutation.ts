import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";

import { linkdingFetch } from "@/lib/api";
import { db } from "@/lib/db";
import { useBackgroundSync } from "@/providers/background-sync";

const generateTempId = () => `temp-${nanoid()}`;

interface BaseEntity {
  [key: string]: any;
}

interface OfflineMutationOptions<TVariables> {
  queryKey: string[];
  url: string;
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  updateLocalCache?: (oldData: any, newVariables: TVariables) => any;
  idField?: string;
}

type OfflineResult<T = unknown> = { offline: true } | T;

export function useOfflineMutation<
  TVariables extends BaseEntity | string | number,
  TResult = unknown,
>(options: OfflineMutationOptions<TVariables>) {
  const queryClient = useQueryClient();
  const { isOnline } = useBackgroundSync();
  const { idField = "id" } = options;

  return useMutation<
    OfflineResult<TResult>,
    unknown,
    TVariables,
    {
      previousData: [QueryKey, unknown][];
    }
  >({
    mutationFn: async (variables: TVariables) => {
      let resourcePath = options.url;
      const idValue =
        typeof variables === "object" && variables !== null
          ? (variables as BaseEntity)[idField]
          : variables;

      if (["PUT", "PATCH", "DELETE"].includes(options.method) && idValue) {
        resourcePath = resourcePath.endsWith("/")
          ? `${resourcePath}${idValue}`
          : `${resourcePath}/${idValue}`;
      }

      try {
        if (!isOnline) {
          await db.outbox.add({
            resourcePath,
            method: options.method,
            body: variables,
            timestamp: Date.now(),
          });
          return { offline: true };
        }

        return await linkdingFetch(resourcePath, {
          method: options.method,
          body: JSON.stringify(variables),
        });
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "AbortError" ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError"))
        ) {
          await db.outbox.add({
            resourcePath,
            method: options.method,
            body: variables,
            timestamp: Date.now(),
          });
          return { offline: true };
        }
        throw error;
      }
    },
    onMutate: async (newVariables) => {
      await queryClient.cancelQueries({ queryKey: options.queryKey });
      const previousData = queryClient.getQueriesData({
        queryKey: options.queryKey,
      });

      const updater = (old: any) => {
        if (!old) return old;

        if (options.method === "DELETE") {
          const targetId =
            typeof newVariables === "object" && newVariables !== null
              ? (newVariables as BaseEntity)[idField]
              : newVariables;

          if (Array.isArray(old)) {
            return old.filter((item) => item[idField] !== targetId);
          }

          return {
            ...old,
            count: old.count ? old.count - 1 : 0,
            results: old.results?.filter((item: any) => item[idField] !== targetId),
          };
        }

        if (options.method === "POST") {
          if (options.url === "bookmarks" || isOnline) {
            return old;
          }

          const newItem = {
            ...(newVariables as object),
            [idField]: generateTempId(),
            _isPending: true,
          };

          if (Array.isArray(old)) {
            return [newItem, ...old];
          }

          return {
            ...old,
            count: (old.count || 0) + 1,
            results: [newItem, ...(old.results || [])],
          };
        }

        if (options.method === "PUT" || options.method === "PATCH") {
          const vars = newVariables as BaseEntity;

          const mergeItem = (item: any) => {
            if (String(item[idField]) !== String(vars[idField])) return item;
            return { ...item, ...vars, _isOfflinePending: !isOnline };
          };

          if (Array.isArray(old)) {
            return old.map(mergeItem);
          }

          return {
            ...old,
            results: old.results?.map(mergeItem),
          };
        }

        return old;
      };

      queryClient.setQueriesData({ queryKey: options.queryKey, exact: false }, updater);

      return { previousData };
    },
    onError: (_err, _var, context) => {
      if (context?.previousData) {
        context?.previousData?.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSuccess: (result: OfflineResult<TResult>, variables: TVariables) => {
      queryClient.setQueriesData({ queryKey: options.queryKey, exact: false }, (old: any) => {
        if (!old) return old;

        const updateItem = (item: any) => {
          const isMatch = String(item[idField]) === String((variables as any)[idField]);
          if (!isMatch) return item;

          return { ...item, ...(result as object), _isOfflinePending: false };
        };

        if (Array.isArray(old)) return old.map(updateItem);
        return {
          ...old,
          results: old.results?.map(updateItem),
        };
      });
    },
    onSettled: (_data, error) => {
      if (error) {
        queryClient.invalidateQueries({ queryKey: options.queryKey });
      }
    },
  });
}
