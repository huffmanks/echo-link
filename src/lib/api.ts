import { QueryClient } from "@tanstack/react-query";

import { logout } from "@/lib/auth";
import { useSettingsStore } from "@/lib/store";
import { cleanUrl } from "@/lib/utils";

export async function linkdingFetch<T>(
  endpoint: string,
  { params, ...options }: RequestInit & { params?: Record<string, string> } = {}
): Promise<T> {
  const { token } = useSettingsStore.getState();

  const cleanEndpoint = endpoint.replace(/^\//, "");
  const normalizedPath = cleanEndpoint.endsWith("/") ? cleanEndpoint : `${cleanEndpoint}/`;

  const url = new URL(`/api/${normalizedPath}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...options,
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (response.status === 401) {
    logout();
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.detail || `API Error: ${response.status}`) as any;
    error.status = response.status;
    error.response = response;
    throw error;
  }

  if (response.status === 204) return {} as T;

  const data = await response.json();

  return JSON.parse(JSON.stringify(data), (_key, value) => {
    if (typeof value === "string" && value.includes("/static/")) {
      return cleanUrl(value);
    }
    return value;
  });
}

export async function safeEnsure(queryClient: QueryClient, options: any) {
  const cached = queryClient.getQueryData(options.queryKey);
  if (cached !== undefined) return cached;

  try {
    return await queryClient.ensureQueryData(options);
  } catch {
    const fallback = { results: [], offline: true };
    queryClient.setQueryData(options.queryKey, fallback);
    return fallback;
  }
}
