"use client";

import PaginationComponent from "@/components/action-components/PaginationComponent";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  return (
    <PaginationComponent
      currentPage={currentPage}
      totalItems={totalItems}
      pageSize={itemsPerPage}
      onPageChange={onPageChange}
      pageBase={1}
      size="sm"
      className="select-none"
    />
  );
}
