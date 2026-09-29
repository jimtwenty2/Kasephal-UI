"use client";

type PageToken = number | "ellipsis";

type PaginationControlsProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export default function PaginationControls({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  disabled = false,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startItem =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  const pages = getPages(safeCurrentPage, totalPages);

  return (
    <div className="flex select-none flex-col items-center justify-between gap-3 px-1 py-2 sm:flex-row">
      <p className="order-2 text-sm font-medium text-secondary-body sm:order-1">
        Showing{" "}
        <span className="font-semibold text-primary-heading">
          {startItem}-{endItem}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-primary-heading">
          {totalItems.toLocaleString()}
        </span>{" "}
        results
      </p>

      <div className="order-1 flex items-center gap-1 sm:order-2">
        <PageArrow
          label="Previous page"
          disabled={disabled || safeCurrentPage === 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          direction="previous"
        />

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm font-semibold text-secondary-body/50"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
                safeCurrentPage === page
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "bg-[#F0F0F0] text-primary hover:bg-white hover:text-slate-800"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <PageArrow
          label="Next page"
          disabled={disabled || safeCurrentPage === totalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          direction="next"
        />
      </div>
    </div>
  );
}

function getPages(currentPage: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: PageToken[] = [1];

  if (currentPage > 3) pages.push("ellipsis");

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) pages.push("ellipsis");

  pages.push(totalPages);

  return pages;
}

function PageArrow({
  label,
  disabled,
  onClick,
  direction,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  direction: "previous" | "next";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-primary transition-all hover:bg-white hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
      aria-label={label}
    >
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d={direction === "previous" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
        />
      </svg>
    </button>
  );
}
