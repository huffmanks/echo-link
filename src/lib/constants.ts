import {
  BookmarkIcon,
  FolderIcon,
  HashIcon,
  PlusIcon,
  SettingsIcon,
  ShieldUserIcon,
} from "lucide-react";

import type { SidebarNavItem } from "@/types";

import LinkdingIcon from "@/components/linkding-icon";

export const APP_TITLE = "EchoLink";
export const APP_DESCRIPTION = "Self-hosted client app for Linkding.";

export const DEFAULT_TTL = 60 * 60 * 24 * 90;

export const SIDEBAR_NAV_MAIN = [
  {
    name: "Add",
    isActive: false,
    icon: PlusIcon,
    isCollapsible: true,
    items: [
      {
        name: "Bookmark",
        url: "/dashboard/add/bookmark",
        isActive: false,
      },
      {
        name: "Folder",
        url: "/dashboard/add/folder",
        isActive: false,
      },
      {
        name: "Tag",
        isActive: false,
        isModal: true,
      },
    ],
  },
  {
    name: "Bookmarks",
    url: "/dashboard",
    isActive: false,
    icon: BookmarkIcon,
  },
] as Array<SidebarNavItem>;

export const SIDEBAR_NAV_SECONDARY = [
  {
    name: "Settings",
    url: "/dashboard/settings",
    isActive: false,
    isExternal: false,
    icon: SettingsIcon,
  },
  {
    name: "Admin",
    url: "/admin",
    isActive: false,
    isExternal: true,
    icon: ShieldUserIcon,
  },
  {
    name: "Web UI",
    url: "bookmarks",
    isActive: false,
    isExternal: true,
    icon: LinkdingIcon,
  },
] as Array<SidebarNavItem>;

export const DRAWER_MOBILE_NAV = [
  {
    name: "Bookmarks",
    url: "/dashboard",
    isActive: false,
    icon: BookmarkIcon,
  },
  {
    name: "Folders",
    url: "/dashboard/folders",
    isActive: false,
    isCollapsible: true,
    icon: FolderIcon,
  },
  {
    name: "Add",
    url: "/dashboard/add",
    isActive: false,
    isCollapsible: true,
    icon: PlusIcon,
  },
  {
    name: "Tags",
    url: "/dashboard/tags",
    isActive: false,
    isCollapsible: true,
    icon: HashIcon,
  },
  {
    name: "Settings",
    url: "/dashboard/settings",
    isActive: false,
    icon: SettingsIcon,
  },
] as Array<SidebarNavItem>;

export const FILTER_OPTIONS = [
  {
    value: "A",
    items: [
      {
        label: "Read",
        value: "read",
      },
      {
        label: "Unread",
        value: "unread",
      },
    ],
  },
  {
    value: "B",
    items: [
      {
        label: "Private",
        value: "private",
      },
      {
        label: "Shared",
        value: "shared",
      },
    ],
  },
  {
    value: "C",
    items: [
      {
        label: "Active",
        value: "active",
      },
      {
        label: "Archived",
        value: "archived",
      },
    ],
  },
] as const;

export const BASE_SELECT_OPTIONS = [
  {
    label: "Select action",
    value: null,
  },
];

export const READ_BULK_SELECT_OPTIONS = [
  {
    label: "Mark as read",
    value: "read",
  },
  {
    label: "Mark as unread",
    value: "unread",
  },
];

export const SHARE_BULK_SELECT_OPTIONS = [
  {
    label: "Share",
    value: "share",
  },
  {
    label: "Unshare",
    value: "unshare",
  },
];

export const ARCHIVE_BULK_SELECT_OPTIONS = [
  {
    label: "Archive",
    value: "archive",
  },
  {
    label: "Unarchive",
    value: "unarchive",
  },
];

export const DELETE_BULK_SELECT_OPTIONS = [
  {
    label: "Delete",
    value: "delete",
  },
];

export const BOOKMARK_BULK_SELECT_OPTIONS = [
  ...BASE_SELECT_OPTIONS,
  ...READ_BULK_SELECT_OPTIONS,
  ...SHARE_BULK_SELECT_OPTIONS,
  ...ARCHIVE_BULK_SELECT_OPTIONS,
  ...DELETE_BULK_SELECT_OPTIONS,
];

export const FOLDER_BULK_SELECT_OPTIONS = [...BASE_SELECT_OPTIONS, ...DELETE_BULK_SELECT_OPTIONS];
