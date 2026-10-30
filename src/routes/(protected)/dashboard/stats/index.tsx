import { useMemo } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArchiveIcon,
  BellIcon,
  BookOpenIcon,
  CameraIcon,
  FolderIcon,
  GlobeIcon,
  HashIcon,
  Share2Icon,
  TrendingUpIcon,
} from "lucide-react";

import { safeEnsure } from "@/lib/api";
import { getAllQueryOptions } from "@/lib/queries";
import {
  cn,
  getMonthlyCount,
  getSharedCount,
  getTopTenDomains,
  getTopTenTags,
  getUnreadCount,
} from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/(protected)/dashboard/stats/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await safeEnsure(queryClient, getAllQueryOptions.bookmarkList(""));
    await safeEnsure(queryClient, getAllQueryOptions.folders);
    await safeEnsure(queryClient, getAllQueryOptions.tags);
    await safeEnsure(queryClient, getAllQueryOptions.archivedList);
  },
});

function RouteComponent() {
  const { data: bookmarksData } = useSuspenseQuery(getAllQueryOptions.bookmarkList(""));
  const { data: foldersData } = useSuspenseQuery(getAllQueryOptions.folders);
  const { data: tagsData } = useSuspenseQuery(getAllQueryOptions.tags);
  const { data: archivedData } = useSuspenseQuery(getAllQueryOptions.archivedList);

  const STAT_DETAILS = useMemo(() => {
    const createdBookmarksThisMonth = getMonthlyCount(bookmarksData.results);

    return [
      {
        id: "06df0cfb-d0e9-4238-a7af-2db6f36a1cb6",
        name: "Bookmarks",
        icon: BookOpenIcon,
        stat: bookmarksData.count,
        note: "TOTAL",
      },
      {
        id: "fd1db475-f312-43af-8dcc-a44a3272912e",
        name: "Folders",
        icon: FolderIcon,
        stat: foldersData.count,
        note: "TOTAL",
      },
      {
        id: "414430bb-d48c-477d-8d6c-117f22fe35e4",
        name: "Tags",
        icon: HashIcon,
        stat: tagsData.count,
        note: "TOTAL",
      },
      {
        id: "ae76bc0d-f2ed-4de5-9d34-bd978cd12367",
        name: "Snapshots",
        icon: CameraIcon,
        stat: bookmarksData.results.filter((b) => b.web_archive_snapshot_url).length,
        note: "TOTAL",
      },
      {
        id: "81d34ddf-8707-4424-a644-a468c13630bf",
        name: "Archived",
        icon: ArchiveIcon,
        stat: archivedData.count,
        note: "TOTAL",
      },
      {
        id: "aae24d3d-e2a1-4b54-8546-79c43caf6e19",
        name: "Unread",
        icon: BellIcon,
        stat: getUnreadCount(bookmarksData.results),
        note: "TOTAL",
      },
      {
        id: "25d3ee2c-afde-4bfe-975f-4d95c0339aaf",
        name: "Shared",
        icon: Share2Icon,
        stat: getSharedCount(bookmarksData.results),
        note: "TOTAL",
      },
      {
        id: "6b18a353-00a4-42d9-af65-c43ac2076942",
        name: "This month",
        icon: TrendingUpIcon,
        stat: createdBookmarksThisMonth,
        note: `BOOKMARK${createdBookmarksThisMonth !== 1 ? "S" : ""} CREATED`,
      },
      {
        id: "ed0b7e4e-72a4-4ec5-ab93-410cc2e3fa57",
        name: "Top domains",
        icon: GlobeIcon,
        colSpan: 2,
        list: getTopTenDomains(bookmarksData.results),
      },
      {
        id: "3d60c1a2-8795-4c2e-a44b-ecc2f5cef6e4",
        name: "Most used tags",
        icon: HashIcon,
        colSpan: 2,
        list: getTopTenTags(bookmarksData.results),
      },
    ];
  }, [
    bookmarksData.count,
    bookmarksData.results,
    foldersData.count,
    tagsData.count,
    archivedData.count,
  ]);

  return (
    <div className="grid grid-cols-1 gap-8 px-2 py-8 md:grid-cols-2 xl:grid-cols-4">
      {STAT_DETAILS.map((item) => (
        <Card key={item.id} className={cn("gap-4", item.colSpan === 2 && "md:col-span-2")}>
          <CardHeader>
            <CardTitle className="flex justify-between gap-4">
              <span>{item.name}</span>
              <item.icon className="text-primary size-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {typeof item.stat === "number" && (
              <>
                <h2 className="mb-1 text-2xl font-bold">{item.stat}</h2>
                <p className="text-muted-foreground text-xs tracking-wider uppercase">
                  {item.note}
                </p>
              </>
            )}

            {item.list && (
              <ol className="marker:text-primary list-outside list-decimal space-y-1.5 pr-px pl-6">
                {item.list.map((subItem) => (
                  <li key={subItem.name}>
                    <div className="flex justify-between gap-2">
                      <span>{subItem.name}</span>
                      <Badge size="icon" variant="invert" className="min-w-5">
                        {subItem.count}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
