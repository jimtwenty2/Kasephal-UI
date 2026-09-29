"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationSize = "sm" | "md" | "lg";

type PaginationComponentProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  className?: string;
  showSummary?: boolean;
  pageBase?: 0 | 1;
  disabled?: boolean;
};

const sizeStyles: Record<
  PaginationSize,
  {
    container: string;
    text: string;
    button: string;
    gap: string;
  }
> = {
  sm: {
    container: "px-4 py-3",
    text: "text-sm",
    button: "h-8 w-8 text-sm",
    gap: "gap-3",
  },
  md: {
    container: "px-8 py-5",
    text: "text-[16px]",
    button: "h-10 w-10 text-[16px]",
    gap: "gap-5",
  },
  lg: {
    container: "px-10 py-6",
    text: "text-base",
    button: "h-11 w-11 text-base",
    gap: "gap-6",
  },
};

export default function PaginationComponent({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  size = "md",
  className = "",
  showSummary = true,
  pageBase = 0,
  disabled = false,
}: PaginationComponentProps) {
  const styles = sizeStyles[size];
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPageIndex = pageBase === 1 ? currentPage - 1 : currentPage;
  const safeCurrentPageIndex = Math.min(
    Math.max(currentPageIndex, 0),
    totalPages - 1,
  );

  if (totalItems === 0) return null;

  const startItem = safeCurrentPageIndex * pageSize + 1;
  const endItem = Math.min((safeCurrentPageIndex + 1) * pageSize, totalItems);

  const isFirstPage = safeCurrentPageIndex === 0;
  const isLastPage = safeCurrentPageIndex >= totalPages - 1;
  const toExternalPage = (pageIndex: number) =>
    pageBase === 1 ? pageIndex + 1 : pageIndex;

  const groupSize = 3;
  const currentGroup = Math.floor(safeCurrentPageIndex / groupSize);
  const startPage = currentGroup * groupSize;
  const endPage = Math.min(startPage + groupSize - 1, totalPages - 1);

  const visiblePages = [];
  for (let pageIndex = startPage; pageIndex <= endPage; pageIndex++) {
    visiblePages.push(pageIndex);
  }

  return (
    <div
      className={`max-w-full  border border-[#E2E8F0] bg-white shadow-sm ${styles.container} ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {showSummary && (
          <p className={`${styles.text} font-medium text-[#3F5876]`}>
            Showing {startItem} to {endItem} of {totalItems} results
          </p>
        )}

        <div
          className={`flex flex-wrap items-center ${styles.gap} min-h-[2.5rem]`}
        >
          <button
            type="button"
            disabled={disabled || isFirstPage}
            onClick={() => onPageChange(toExternalPage(safeCurrentPageIndex - 1))}
            className={`flex items-center gap-1 font-medium text-[#3F5876] transition hover:text-[#007A4D] disabled:cursor-not-allowed disabled:text-[#CBD5E1] ${styles.text}`}
          >
            <ChevronLeft size={20} />
            Prev
          </button>

          <div className="flex flex-wrap items-center gap-3">
            {visiblePages.map((pageIndex) => {
              const isActive = pageIndex === safeCurrentPageIndex;

              return (
                <button
                  key={pageIndex}
                  type="button"
                  disabled={disabled}
                  onClick={() => onPageChange(toExternalPage(pageIndex))}
                  className={`flex items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles.button} ${isActive
                    ? "bg-[#007A4D] text-white shadow-sm"
                    : "text-[#3F5876] hover:bg-[#EAF2EF] hover:text-[#007A4D]"
                    }`}
                >
                  {pageIndex + 1}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={disabled || isLastPage}
            onClick={() => onPageChange(toExternalPage(safeCurrentPageIndex + 1))}
            className={`flex items-center gap-1 font-medium text-[#3F5876] transition hover:text-[#007A4D] disabled:cursor-not-allowed disabled:text-[#CBD5E1] ${styles.text}`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
