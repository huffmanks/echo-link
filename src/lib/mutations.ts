import { useOfflineMutation } from "@/hooks/use-offline-mutation";
import type { Bookmark, BookmarkInsert, Folder, FolderInsert, Tag, TagInsert } from "@/types";

export function useCreateBookmark() {
  return useOfflineMutation<BookmarkInsert, Bookmark>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "POST",
  });
}

export function useEditBookmark() {
  return useOfflineMutation<BookmarkInsert & { id: number }, Bookmark>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "PUT",
    idField: "id",
  });
}

export type BulkUpdatePayload =
  { delete: null } | { unread: boolean } | { is_archived: boolean } | { shared: boolean };

export function useBulkEditBookmarks() {
  return useOfflineMutation<BulkUpdatePayload & { id: number }, Bookmark>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "PATCH",
    idField: "id",
  });
}

export function useToggleReadBookmark() {
  return useOfflineMutation<Pick<BookmarkInsert, "unread"> & { id: number }, Bookmark>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "PATCH",
    idField: "id",
  });
}

export function useToggleArchiveBookmark() {
  return useOfflineMutation<Pick<BookmarkInsert, "is_archived"> & { id: number }, Bookmark>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "PATCH",
    idField: "id",
  });
}

export function useToggleShareBookmark() {
  return useOfflineMutation<Pick<BookmarkInsert, "shared"> & { id: number }, Bookmark>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "PATCH",
    idField: "id",
  });
}

export function useDeleteBookmark() {
  return useOfflineMutation<number>({
    queryKey: ["bookmarks"],
    url: "bookmarks",
    method: "DELETE",
    idField: "id",
  });
}

export function useCreateFolder() {
  return useOfflineMutation<FolderInsert, Folder>({
    queryKey: ["bundles"],
    url: "bundles",
    method: "POST",
  });
}

export function useEditFolder() {
  return useOfflineMutation<FolderInsert & { id: number; order?: number }, Folder>({
    queryKey: ["bundles"],
    url: "bundles",
    method: "PUT",
    idField: "id",
  });
}

export function useDeleteFolder() {
  return useOfflineMutation<number>({
    queryKey: ["bundles"],
    url: "bundles",
    method: "DELETE",
    idField: "id",
  });
}

export function useCreateTag() {
  return useOfflineMutation<TagInsert, Tag>({
    queryKey: ["tags"],
    url: "tags",
    method: "POST",
  });
}

export function useDeleteTag() {
  return useOfflineMutation<number>({
    queryKey: ["tags"],
    url: "tags",
    method: "DELETE",
    idField: "id",
  });
}
