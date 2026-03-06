import { useMemo, useState } from "react";

import {
  ArrowDownAzIcon,
  ArrowUpAzIcon,
  CalendarArrowDownIcon,
  CalendarArrowUpIcon,
  CalendarIcon,
  FunnelIcon,
  LayoutGridIcon,
  ListIcon,
  SearchXIcon,
  Table2Icon,
} from "lucide-react";
import { flushSync } from "react-dom";
import { useShallow } from "zustand/react/shallow";

import { usePagination } from "@/hooks/use-pagination";
import { type AppRouteId, useSearchState } from "@/hooks/use-search-state";
import { FILTER_OPTIONS } from "@/lib/constants";
import type { SortField } from "@/lib/search";
import { useSettingsStore } from "@/lib/store";
import { useBackgroundSync } from "@/providers/background-sync";
import type { Bookmark, View } from "@/types";

import BookmarkSheet from "@/components/blocks/bookmark/sheet";
import BookmarkGridView from "@/components/blocks/bookmark/views/grid";
import BookmarkListView from "@/components/blocks/bookmark/views/list";
import BookmarkTableView from "@/components/blocks/bookmark/views/table";
import { EmptyCache } from "@/components/default-error-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface BookmarkWrapperProps {
  appRouteId: AppRouteId;
  heading: string;
  bookmarkItems: Bookmark[];
  totalCount: number;
  totalPages: number;
  hasNextCurrent: boolean;
  hasPreviousCurrent: boolean;
  emptyComponent: React.ReactNode;
  children?: React.ReactNode;
}

export default function BookmarkWrapper({
  appRouteId,
  heading,
  emptyComponent,
  bookmarkItems,
  totalCount,
  totalPages,
  hasNextCurrent,
  hasPreviousCurrent,
  children,
}: BookmarkWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  const anchor = useComboboxAnchor();
  const { isOnline } = useBackgroundSync();

  const { search, setParams } = useSearchState(appRouteId);

  const { limit, view, setView } = useSettingsStore(
    useShallow((state) => ({
      limit: state.limit,
      view: state.view,
      setView: state.setView,
    }))
  );

  const {
    currentPage,
    pageNumbers,
    handleNext,
    handlePrevious,
    handlePageClick,
    hasNext,
    hasPrevious,
  } = usePagination({
    appRouteId,
    totalPages,
    hasNext: hasNextCurrent,
    hasPrevious: hasPreviousCurrent,
  });

  function handleOpenSheet(bookmark: Bookmark) {
    setSelectedBookmark(bookmark);
    setIsOpen(true);
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);

    if (!open) {
      setSelectedBookmark(null);
    }
  }

  function handleValueChange(values: string[]) {
    const nextView = values[values.length - 1] as View;
    if (!nextView) return;

    if (!document.startViewTransition) {
      setView(nextView);
      return;
    }

    document.startViewTransition(() => {
      flushSync(() => {
        setView(nextView);
      });
    });
  }

  const activeFilters = useMemo(() => {
    const active: string[] = [];
    if (search.read === true) active.push("read");
    if (search.unread === true) active.push("unread");
    if (search.shared === true) active.push("shared");
    if (search.private === true) active.push("private");
    if (search.archived === true) active.push("archived");
    if (search.active === true) active.push("active");
    return active;
  }, [search]);

  function handleComboboxChange(values: string[]) {
    setParams((prev) => {
      const newAddition = values.find((v) => !activeFilters.includes(v));

      return {
        ...prev,

        read: values.includes("read") && newAddition !== "unread" ? true : undefined,
        unread: values.includes("unread") && newAddition !== "read" ? true : undefined,

        private: values.includes("private") && newAddition !== "shared" ? true : undefined,
        shared: values.includes("shared") && newAddition !== "private" ? true : undefined,

        active: values.includes("active") && newAddition !== "archived" ? true : undefined,
        archived: values.includes("archived") && newAddition !== "active" ? true : undefined,
      };
    });
  }

  function handleSortChange(field: SortField[]) {
    const clickedField = field[0];

    setParams((prev) => {
      if (!clickedField) {
        return {
          ...prev,
          order: prev.order === "asc" ? "desc" : "asc",
        };
      }

      if (clickedField !== prev.sort) {
        return {
          ...prev,
          sort: clickedField,
          order: "asc",
        };
      }

      return prev;
    });
  }

  function clearAllFilters() {
    setParams((prev) => ({
      ...prev,
      q: undefined,
      read: undefined,
      unread: undefined,
      shared: undefined,
      private: undefined,
      archived: undefined,
      active: undefined,
    }));
  }

  const isSearchingOrFiltering = activeFilters.length > 0 || (!!search.q && search.q !== "");
  const hasResults = bookmarkItems.length > 0;

  if (!isOnline && !hasResults) {
    return <EmptyCache />;
  }

  if (totalCount === 0 && !isSearchingOrFiltering) {
    return emptyComponent;
  }

  const hasFilters = activeFilters.length > 0;

  return (
    <div>
      <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:px-2 lg:flex-row">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">{heading}</h1>
          {children}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <ToggleGroup
              variant="outline"
              multiple={false}
              value={search.sort ? [search.sort] : []}
              onValueChange={(val) => handleSortChange(val as SortField[])}>
              <ToggleGroupItem value="title" aria-label="Sort by title">
                {search.sort === "title" ? (
                  search.order === "asc" ? (
                    <ArrowUpAzIcon />
                  ) : (
                    <ArrowDownAzIcon />
                  )
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <path d="M14.5 5.75h7l-7 10h7" />
                    <path d="m2 16 4.039-9.69a.5.5 0 0 1 .923 0L11 16" />
                    <path d="M3.304 13h6.392" />
                  </svg>
                )}
              </ToggleGroupItem>

              <ToggleGroupItem value="date_modified" aria-label="Sort by date">
                {search.sort === "date_modified" ? (
                  search.order === "asc" ? (
                    <CalendarArrowUpIcon />
                  ) : (
                    <CalendarArrowDownIcon />
                  )
                ) : (
                  <CalendarIcon />
                )}
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              variant="outline"
              multiple={false}
              value={[view]}
              onValueChange={handleValueChange}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGridIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <ListIcon />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Table view">
                <Table2Icon />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Combobox
            multiple
            autoHighlight
            items={FILTER_OPTIONS}
            value={activeFilters}
            onValueChange={(val) => handleComboboxChange(val as string[])}>
            <div className="relative">
              <ComboboxTrigger
                render={
                  <Button variant="outline" className="cursor-pointer">
                    <FunnelIcon className="size-4" />
                    <span className="hidden sm:inline-block">Filters</span>
                  </Button>
                }></ComboboxTrigger>
              {hasFilters && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="flex size-5 items-center justify-center rounded-full p-1 text-xs">
                    {activeFilters.length}
                  </Badge>
                </div>
              )}
            </div>

            <ComboboxContent anchor={anchor} className="w-32" align="end">
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(group, index) => (
                  <ComboboxGroup key={group.value} items={group.items}>
                    <ComboboxCollection>
                      {(item) => (
                        <ComboboxItem key={item.label} value={item.value}>
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxCollection>
                    {index < FILTER_OPTIONS.length - 1 && <ComboboxSeparator />}
                  </ComboboxGroup>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>

      {!hasResults && isSearchingOrFiltering ? (
        <EmptyFilterResults clearAllFilters={clearAllFilters} />
      ) : (
        <>
          {hasResults && view !== "table" && (
            <p className="text-muted-foreground mb-4 pl-2 text-sm">
              {totalCount} result{totalCount > 1 ? "s" : ""}
            </p>
          )}
          <div className="view-content overflow-hidden">
            {view === "grid" && (
              <BookmarkGridView
                bookmarks={bookmarkItems}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            )}

            {view === "list" && (
              <BookmarkListView
                bookmarks={bookmarkItems}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            )}

            {view === "table" && (
              <BookmarkTableView
                bookmarks={bookmarkItems}
                count={totalCount}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            )}
          </div>

          {selectedBookmark && (
            <BookmarkSheet
              isOpen={isOpen}
              bookmark={selectedBookmark}
              handleOpenChange={handleOpenChange}
            />
          )}

          {totalCount > limit && (
            <Pagination className="mb-10">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevious}
                    className={!hasPrevious ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {pageNumbers.map((page, i) => (
                  <PaginationItem key={typeof page === "string" ? `el-${i}` : page}>
                    {page === "ellipsis-start" || page === "ellipsis-end" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={currentPage === page}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageClick(page as number);
                        }}>
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNext}
                    className={!hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}

function EmptyFilterResults({ clearAllFilters }: { clearAllFilters: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>No matches found</EmptyTitle>
        <EmptyDescription>
          No bookmarks match those filters. Try resetting the filters below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button className="cursor-pointer" onClick={clearAllFilters}>
            Reset filters
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
