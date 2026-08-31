import { useMemo, useState } from "react";

import {
  CalendarClockIcon,
  CalendarPlusIcon,
  FunnelIcon,
  LayoutGridIcon,
  ListIcon,
  MoveDownIcon,
  MoveUpIcon,
  SearchXIcon,
  Table2Icon,
} from "lucide-react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";

import { useBackgroundSync } from "@/context/background-sync";
import { useGlobalModal } from "@/context/global-modal";
import { usePagination } from "@/hooks/use-pagination";
import { type AppRouteId, useSearchState } from "@/hooks/use-search-state";
import { BOOKMARK_BULK_SELECT_OPTIONS, FILTER_OPTIONS } from "@/lib/constants";
import { type BulkUpdatePayload, useBulkEditBookmarks, useDeleteBookmark } from "@/lib/mutations";
import { type BulkAction, useBulkSelectionStore } from "@/lib/store/bulk-selection";
import { useSettingsStore } from "@/lib/store/settings";
import { getPaginationLabel } from "@/lib/utils";
import type { Bookmark, DefaultSortType, View } from "@/types";

import BulkActionBar from "@/components/blocks/bookmark/bulk-action-bar";
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
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface BookmarkWrapperProps {
  appRouteId: AppRouteId;
  heading: string;
  bookmarkItems: Array<Bookmark>;
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<Bookmark | null>(null);

  const { setActiveGlobalDrawer } = useGlobalModal();
  const anchor = useComboboxAnchor();
  const { isOnline } = useBackgroundSync();
  const { mutate: editBookmark } = useBulkEditBookmarks();
  const { mutate: deleteBookmark } = useDeleteBookmark();

  const { search, setParams } = useSearchState(appRouteId);
  const { selectedIds, bulkAction, clearSelection, setCurrentBulkAction, stopBulkSelection } =
    useBulkSelectionStore(
      useShallow((state) => ({
        selectedIds: state.selectedIds,
        bulkAction: state.bulkAction,
        clearSelection: state.clearSelection,
        setCurrentBulkAction: state.setCurrentBulkAction,
        stopBulkSelection: state.stopBulkSelection,
      }))
    );

  const { limit, view, defaultSortType, continueBulkEdit, keepBulkSelection, setView } =
    useSettingsStore(
      useShallow((state) => ({
        limit: state.limit,
        view: state.view,
        defaultSortType: state.defaultSortType,
        continueBulkEdit: state.continueBulkEdit,
        keepBulkSelection: state.keepBulkSelection,
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
    setActiveGlobalDrawer(String(bookmark.id));
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setSelectedBookmark(null);
      setActiveGlobalDrawer(null);
    }
  }

  function handleValueChange(values: Array<string>) {
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
    const active: Array<string> = [];
    if (search.read === true) active.push("read");
    if (search.unread === true) active.push("unread");
    if (search.shared === true) active.push("shared");
    if (search.private === true) active.push("private");
    if (search.archived === true) active.push("archived");
    if (search.active === true) active.push("active");
    return active;
  }, [search]);

  function handleComboboxChange(values: Array<string>) {
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

  const activeSort = search.sort ?? defaultSortType;
  const activeOrder = search.order ?? (activeSort === "title" ? "asc" : "desc");

  function toggleOrder() {
    setParams((prev) => ({
      ...prev,
      sort: activeSort,
      order: activeOrder === "asc" ? "desc" : "asc",
    }));
  }

  function handleSortChange(field: Array<DefaultSortType>) {
    const clickedField = field[0];

    setParams((prev) => {
      const isSameField = !clickedField || clickedField === activeSort;

      if (isSameField) {
        return {
          ...prev,
          sort: activeSort,
          order: activeOrder === "asc" ? "desc" : "asc",
        };
      }

      return {
        ...prev,
        sort: clickedField,
        order: activeOrder,
      };
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

  async function handleBulkEdit() {
    if (!bulkAction || selectedIds.size === 0) return;

    const actionMap: Record<BulkAction, BulkUpdatePayload> = {
      delete: { delete: null },
      read: { unread: false },
      unread: { unread: true },
      archive: { is_archived: true },
      unarchive: { is_archived: false },
      share: { shared: true },
      unshare: { shared: false },
    };

    try {
      const promises = Array.from(selectedIds).map((id) => {
        if (bulkAction === "delete") {
          return deleteBookmark(id);
        } else {
          const payload = actionMap[bulkAction as keyof typeof actionMap];
          return editBookmark({ ...payload, id });
        }
      });

      const batchPromise = Promise.all(promises);

      toast.promise(batchPromise, {
        loading: `Executing ${bulkAction} on ${selectedIds.size} items...`,
        success: () => {
          handlePostBulkAction();

          return "Bulk actions completed!";
        },
        error: "Error, something went wrong!",
      });
    } catch (error) {}
  }

  function handlePostBulkAction() {
    if (!continueBulkEdit) {
      stopBulkSelection();
    } else if (!keepBulkSelection) {
      clearSelection();
    } else {
      setCurrentBulkAction(null);
    }

    setIsAlertOpen(false);
  }

  const isSearchingOrFiltering = activeFilters.length > 0 || (!!search.q && search.q !== "");
  const hasResults = bookmarkItems.length > 0;

  const paginationLabel = getPaginationLabel({ count: totalCount, limit, currentPage });

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
            <div className="flex items-center">
              <ToggleGroup
                variant="outline"
                multiple={false}
                value={[activeSort]}
                onValueChange={(val) => handleSortChange(val as Array<DefaultSortType>)}>
                <ToggleGroupItem value="title" aria-label="Sort by title">
                  <div className="mt-0.75 flex h-4 w-4 items-center justify-center">
                    <span className="font-mono text-sm leading-none font-semibold">AZ</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="date_added" aria-label="Sort by created date">
                  <CalendarPlusIcon />
                </ToggleGroupItem>
                <ToggleGroupItem
                  className="rounded-none!"
                  value="date_modified"
                  aria-label="Sort by modified date">
                  <CalendarClockIcon />
                </ToggleGroupItem>
              </ToggleGroup>
              <Toggle
                variant="outline"
                pressed={true}
                className="-ml-px cursor-pointer rounded-l-none"
                aria-label="Sort direction"
                onPressedChange={toggleOrder}>
                {activeOrder === "asc" ? (
                  <MoveUpIcon className="size-3 stroke-4" />
                ) : (
                  <MoveDownIcon className="size-3 stroke-4" />
                )}
              </Toggle>
            </div>
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
          <div className="flex items-center gap-2">
            <Combobox
              multiple
              autoHighlight
              items={FILTER_OPTIONS}
              value={activeFilters}
              onValueChange={(val) => handleComboboxChange(val as Array<string>)}>
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

            <BulkActionBar
              entityName="bookmark"
              selectOptions={BOOKMARK_BULK_SELECT_OPTIONS}
              isAlertOpen={isAlertOpen}
              setIsAlertOpen={setIsAlertOpen}
              handleBulkEdit={handleBulkEdit}
              handlePostBulkAction={handlePostBulkAction}
            />
          </div>
        </div>
      </div>

      {!hasResults && isSearchingOrFiltering ? (
        <EmptyFilterResults clearAllFilters={clearAllFilters} />
      ) : (
        <>
          <div className="view-content overflow-hidden">
            {view === "grid" && (
              <BookmarkGridView
                bookmarks={bookmarkItems}
                paginationLabel={paginationLabel}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            )}

            {view === "list" && (
              <BookmarkListView
                bookmarks={bookmarkItems}
                paginationLabel={paginationLabel}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            )}

            {view === "table" && (
              <BookmarkTableView
                bookmarks={bookmarkItems}
                paginationLabel={paginationLabel}
                handleOpenSheet={handleOpenSheet}
                handleOpenChange={handleOpenChange}
              />
            )}
          </div>

          {selectedBookmark && (
            <BookmarkSheet
              bookmark={selectedBookmark}
              isOpen={!!selectedBookmark.id}
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
