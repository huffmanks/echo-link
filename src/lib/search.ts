import { z } from "zod";

import { useSettingsStore } from "@/lib/store";
import type { PaginatedResponse } from "@/types";

const { limit } = useSettingsStore.getState();

export const SearchSchema = z.object({
  q: z.string().optional().catch(""),
  page: z.coerce.number().optional().catch(1),
  limit: z.coerce.number().optional().catch(limit),
  sort: z.enum(["title", "date_added", "date_modified"]).optional().catch("title"),
  order: z.enum(["asc", "desc"]).optional().catch("asc"),
  unread: z.coerce.boolean().optional(),
  read: z.coerce.boolean().optional(),
  active: z.coerce.boolean().optional(),
  archived: z.coerce.boolean().optional(),
  private: z.coerce.boolean().optional(),
  shared: z.coerce.boolean().optional(),
  tags: z.array(z.string()).optional().catch([]),
});

export type SearchParams = z.infer<typeof SearchSchema>;

export type SortField = "title" | "date_added" | "date_modified";

export function transformData<T extends Record<string, any>>(
  rawData: PaginatedResponse<T>,
  params: SearchParams
) {
  let result = [...rawData.results];

  result = result.filter((item) => {
    const { read, unread, active, archived, shared, private: isPrivate, tags } = params;

    if (archived === true && item.is_archived !== true) return false;
    if (active === true && item.is_archived !== false) return false;

    if (read === true && item.unread !== false) return false;
    if (unread === true && item.unread !== true) return false;

    if (shared === true && item.shared !== true) return false;
    if (isPrivate === true && item.shared !== false) return false;

    if (tags && tags.length > 0) {
      const itemTags = (item.tag_names as Array<string>) || [];
      if (!tags.every((t) => itemTags.includes(t))) return false;
    }

    return true;
  });

  if (params.sort) {
    const { sort, order } = params;
    const mod = order === "desc" ? -1 : 1;

    result.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];

      if (sort === "date_modified" || sort === "date_added") {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * mod;
      }

      if (aVal > bVal) return mod;
      if (aVal < bVal) return -mod;
      return 0;
    });
  }

  const paramsPage = params?.page ?? 1;
  const paramsLimit = params?.limit ?? limit;

  const totalCount = result.length;
  const totalPages = Math.ceil(totalCount / paramsLimit);
  const items = result.slice((paramsPage - 1) * paramsLimit, paramsPage * paramsLimit);

  const hasNextCurrent = paramsPage < totalPages;
  const hasPreviousCurrent = paramsPage > 1;

  return { items, totalCount, totalPages, hasNextCurrent, hasPreviousCurrent };
}
