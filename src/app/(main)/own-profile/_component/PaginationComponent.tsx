"use client";

import SharedPaginationComponent from "@/components/action-components/PaginationComponent";

type PaginationComponentProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
};

export default function PaginationComponent({
  currentPage,
  totalItems,
  itemsPerPage = 8,
  onPageChange,
}: PaginationComponentProps) {
  return (
    <SharedPaginationComponent
      currentPage={currentPage}
      totalItems={totalItems}
      pageSize={itemsPerPage}
      onPageChange={onPageChange}
      pageBase={1}
      className="mt-12"
    />
  );
}
