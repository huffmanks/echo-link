import { useMemo } from "react";

import {  useSearchState } from "@/hooks/use-search-state";
import type {AppRouteId} from "@/hooks/use-search-state";

interface UsePaginationProps {
  appRouteId: AppRouteId;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function usePagination({
  appRouteId,
  totalPages,
  hasNext,
  hasPrevious,
}: UsePaginationProps) {
  const { search, setParams } = useSearchState(appRouteId);

  const currentPage = search?.page ?? 1;

  function handleNext() {
    if (hasNext) setParams((prev) => ({ ...prev, page: currentPage + 1 }));
  }

  function handlePrevious() {
    if (hasPrevious) setParams((prev) => ({ ...prev, page: Math.max(0, currentPage - 1) }));
  }

  function handlePageClick(pageNumber: number) {
    setParams((prev) => ({ ...prev, page: pageNumber }));
  }

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis-end"];
    }

    if (currentPage >= totalPages - 2) {
      return ["ellipsis-start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return ["ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end"];
  }, [currentPage, totalPages]);

  return {
    currentPage,
    pageNumbers,
    handleNext,
    handlePrevious,
    handlePageClick,
    hasNext,
    hasPrevious,
  };
}
