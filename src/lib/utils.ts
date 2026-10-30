import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDomain } from "tldts";

import type { Bookmark } from "@/types";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

interface Value {
  [key: string]: string | Array<string>;
}

type ReturnType = "string" | "string_array";

type ProcessedValue<TData, TResult extends ReturnType> = {
  [TKey in keyof TData]: TResult extends "string"
    ? TData[TKey] extends Array<string>
      ? string
      : TData[TKey]
    : TData[TKey];
};

export function processValue<TValue extends Value, TReturnType extends ReturnType>({
  value,
  returnType,
}: {
  value: TValue;
  returnType: TReturnType;
}): ProcessedValue<TValue, TReturnType> {
  const result = {} as any;

  for (const key in value) {
    const currentVal = value[key];

    if (typeof currentVal === "string") {
      result[key] = currentVal;
      continue;
    }

    if (Array.isArray(currentVal)) {
      const cleanedArray = currentVal.filter((item) => item.trim() !== "");

      if (returnType === "string") {
        result[key] = cleanedArray.join(", ");
      } else {
        result[key] = cleanedArray;
      }
    }
  }

  return result as ProcessedValue<TValue, TReturnType>;
}

export function getRelativeTimeString(
  date: Date | string | number,
  lang = navigator.language
): string {
  const timeMs =
    typeof date === "number"
      ? date
      : typeof date === "string"
        ? new Date(date).getTime()
        : date.getTime();
  const diff = timeMs - Date.now();
  const absDiff = Math.abs(diff);

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: "year", ms: 31536000000 },
    { unit: "month", ms: 2592000000 },
    { unit: "day", ms: 86400000 },
    { unit: "hour", ms: 3600000 },
    { unit: "minute", ms: 60000 },
    { unit: "second", ms: 1000 },
  ];

  for (const { unit, ms } of units) {
    if (absDiff >= ms || unit === "second") {
      const value = Math.round(diff / ms);
      const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
      return rtf.format(value, unit);
    }
  }

  return "";
}

export function formatToLocalTime(isoString: string): string {
  const date = new Date(isoString);

  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat(navigator.language, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  }).format(date);
}

export function getPageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | string> = [];
  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis-start");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis-end");
  }

  pages.push(total);
  return pages;
}

export function stringToStringArray(string?: string) {
  if (!string || string.trim() === "") return [];

  return string.split(" ").filter(Boolean);
}

export function joinUrlPath(url: string | null, path: string | null) {
  if (!url || !path) return "";

  let cleanPath = path;

  if (cleanPath.startsWith("http://localhost") || cleanPath.startsWith("http://127.0.0.1")) {
    cleanPath = cleanPath.replace(/^http?:\/\/[^/]+/, "");
  }

  if (cleanPath.startsWith("http")) return cleanPath;

  const cleanBase = url.replace(/\/$/, "");
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return `${cleanBase}${normalizedPath}`;
}

export function cleanUrl(url: string | null | undefined) {
  if (!url) return "";
  return url.replace(/^https?:\/\/[^/]+/, "");
}

export function checkActive({
  pathname,
  url,
  name,
}: {
  pathname: string;
  url?: string;
  name?: string;
}) {
  if (!url) return false;

  if (pathname === "/dashboard" && name === "Bookmarks") return true;

  if (pathname.startsWith(url) && name === "Add") return true;
  if (pathname.startsWith(url) && name === "Folders") return true;
  if (pathname.startsWith(url) && name === "Tags") return true;

  return pathname === url;
}

export function getError(error: unknown) {
  if (!(error instanceof Error)) {
    return { name: "Error", message: String(error) };
  }

  let message: string;

  switch (error.name) {
    case "TimeoutError":
      message = "The request took too long. Please check your connection.";
      break;
    case "AbortError":
      message = "The request was cancelled.";
      break;
    case "TypeError":
      message = error.message.includes("fetch")
        ? "Network error: check your internet or CORS settings."
        : "A system type error occurred.";
      break;
    case "SyntaxError":
      message = "Failed to parse the server response (Invalid JSON).";
      break;
    case "NotAllowedError":
      message = "Permissions were denied for this operation.";
      break;
    default:
      message = error.message || "An unexpected error occurred.";
      break;
  }

  return { name: error.name, message };
}

type HttpError = Error & {
  status: number;
};

export function isHttpError(error: unknown): error is HttpError {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as Record<string, unknown>).status === "number"
  );
}

export function getPaginationLabel({
  count,
  limit,
  currentPage,
}: {
  count: number;
  limit: number;
  currentPage: number;
}) {
  if (count <= limit) {
    return `Total: ${count}`;
  }

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, count);

  return `Showing ${start}–${end} of ${count} items`;
}

export function getActiveHashSegment(value: string, cursorPos: number): [number, number] | null {
  const before = value.slice(0, cursorPos);
  const match = before.match(/(^|\s)(#\S*)$/);
  if (!match) return null;
  const start = before.lastIndexOf(match[2]);
  const end = cursorPos + (value.slice(cursorPos).match(/^\S*/) ?? [""])[0].length;
  return [start, end];
}

export function getUnreadCount(bookmarks: Array<Bookmark>) {
  return bookmarks.reduce((count, bookmark) => {
    return bookmark.unread ? count + 1 : count;
  }, 0);
}

export function getSharedCount(bookmarks: Array<Bookmark>) {
  return bookmarks.reduce((count, bookmark) => {
    return bookmark.shared ? count + 1 : count;
  }, 0);
}

export function getMonthlyCount(bookmarks: Array<Bookmark>) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return bookmarks.reduce((count, bookmark) => {
    const date = new Date(bookmark.date_added);

    const isThisMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear;

    return isThisMonth ? count + 1 : count;
  }, 0);
}

export function getTopTenDomains(bookmarks: Array<Bookmark>) {
  const domainCounts: Record<string, number> = {};

  for (const bookmark of bookmarks) {
    const domain = getDomain(bookmark.url);

    if (domain) {
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
  }

  return Object.entries(domainCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);
}

export function getTopTenTags(bookmarks: Array<Bookmark>) {
  const tagCounts: Record<string, number> = {};

  for (const bookmark of bookmarks) {
    for (const tag of bookmark.tag_names) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);
}
