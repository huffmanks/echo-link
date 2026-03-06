import { queryOptions } from "@tanstack/react-query";

import { linkdingFetch } from "@/lib/api";
import type { Bookmark, BookmarkCheck, Folder, PaginatedResponse, Tag } from "@/types";

export const getAllQueryOptions = {
  bookmarks: queryOptions({
    queryKey: ["bookmarks"],
    queryFn: () =>
      linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks", {
        params: { limit: String(10000) },
      }),
  }),
  bookmarkList: (q: string = "") =>
    queryOptions({
      queryKey: ["bookmarks", { q: String(q).trim() }],
      queryFn: () =>
        linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks", {
          params: {
            q: String(q).trim(),
          },
        }),
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
      queryFn: () =>
        linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks", {
          params: { bundle: id },
        }),
    }),
  tags: queryOptions({
    queryKey: ["tags"],
    queryFn: () => linkdingFetch<PaginatedResponse<Tag>>("tags"),
  }),
  bookmarksByTagName: (tagName: string) =>
    queryOptions({
      queryKey: ["bookmarks", { q: `#${tagName}` }],
      queryFn: () =>
        linkdingFetch<PaginatedResponse<Bookmark>>("bookmarks", {
          params: { q: `#${tagName}` },
        }),
    }),
};
