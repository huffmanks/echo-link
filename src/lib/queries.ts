import { queryOptions } from "@tanstack/react-query";

import { linkdingFetch } from "@/lib/api";
import type { Bookmark, BookmarkCheck, Folder, PaginatedResponse, Tag } from "@/types";

import { useSettingsStore } from "./store/settings";

export const getAllQueryOptions = {
  bookmarks: queryOptions({
    queryKey: ["bookmarks"],
    queryFn: () => fetchAllBookmarks({ limit: String(10000) }),
  }),
  bookmarkList: (q: string = "") =>
    queryOptions({
      queryKey: ["bookmarks", { q: String(q).trim() }],
      queryFn: () => fetchAllBookmarks({ q: String(q).trim() }),
    }),
  archivedList: queryOptions({
    queryKey: ["archived"],
    queryFn: () => linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks/archived"),
  }),
  bookmarkById: (id: string) =>
    queryOptions({
      queryKey: ["bookmarks", id],
      queryFn: () => linkdingFetch<Bookmark>(`bookmarks/${id}`),
    }),
  bookmarkCheckIfExists: (url: string = "") =>
    queryOptions({
      queryKey: ["bookmarksCheck", { url }],
      queryFn: () =>
        linkdingFetch<BookmarkCheck>("bookmarks/check", {
          params: { url: String(url) },
        }),
    }),
  folders: queryOptions({
    queryKey: ["bundles"],
    queryFn: () => linkdingFetch<PaginatedResponse<Folder>>("bundles"),
  }),
  folderById: (id: string) =>
    queryOptions({
      queryKey: ["bundles", id],
      queryFn: () => linkdingFetch<Folder>(`bundles/${id}`),
    }),
  bookmarksByFolderId: (id: string) =>
    queryOptions({
      queryKey: ["bookmarks", { bundle: id }],
      queryFn: () => fetchAllBookmarks({ bundle: id }),
    }),
  tags: queryOptions({
    queryKey: ["tags"],
    queryFn: () => linkdingFetch<PaginatedResponse<Tag>>("tags"),
  }),
  bookmarksByTagName: (tagName: string) =>
    queryOptions({
      queryKey: ["bookmarks", { q: `#${tagName}` }],
      queryFn: () => fetchAllBookmarks({ q: `#${tagName}` }),
    }),
};

async function fetchAllBookmarks(params?: Record<string, string>) {
  const { showArchived } = useSettingsStore.getState();

  const [regular, archived] = await Promise.all([
    linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks", { params }),
    showArchived
      ? linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks/archived", { params })
      : null,
  ]);

  return {
    count: regular.count + (archived?.count ?? 0),
    next: null,
    previous: null,
    results: archived ? [...regular.results, ...archived.results] : regular.results,
  };
}
