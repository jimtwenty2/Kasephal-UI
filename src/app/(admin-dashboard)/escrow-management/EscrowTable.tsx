"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EscrowOverviewChart from "./OverviewEscrow";
import TotalContractsChart from "./TotalContract";
import Table, { TableColumn } from "./../_components/Table";
import Pagination from "./../_components/Pagination";
import AdminDropdown from "../_components/AdminDropdown";
import EscrowDetailModal from "./EscrowDetailModal";
import { formatAdminId } from "@/utils/formatAdminId";
import { formatCurrency } from "./_utils/formatCurrency";
import CurrencyText from "../_components/CurrencyText";
import type {
  AdminEscrowListItem,
  AdminEscrowManagement,
  AdminEscrowPeriod,
  AdminEscrowStatus,
} from "@/types/admin/escrow";

type StatusFilter = "ALL" | AdminEscrowStatus;

interface EscrowTableProps {
  data: AdminEscrowManagement;
  activeStatus: StatusFilter;
  activePeriod: AdminEscrowPeriod;
}

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_LABEL: Record<AdminEscrowStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: AdminEscrowStatus }) {
  const badgeColors: Record<AdminEscrowStatus, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-[12px] font-bold tracking-wide ${badgeColors[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function EscrowTable({
  data,
  activeStatus,
  activePeriod,
}: EscrowTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedEscrow, setSelectedEscrow] =
    useState<AdminEscrowListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const startIndex = (data.pagination.page - 1) * data.pagination.size;

  const pushFilters = useCallback(
    ({
      status = activeStatus,
      period = activePeriod,
      page = 1,
    }: {
      status?: StatusFilter;
      period?: AdminEscrowPeriod;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("period", period);
      params.set("page", String(page));

      if (status === "ALL") {
        params.delete("status");
      } else {
        params.set("status", status);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [activePeriod, activeStatus, pathname, router, searchParams],
  );

  const columns: TableColumn<AdminEscrowListItem>[] = [
    {
      header: "No.",
      render: (_row, index) => (
        <span className="font-medium text-description-text">
          {startIndex + index + 1}
        </span>
      ),
    },
    {
      header: "Escrow ID",
      render: (row) => (
        <span className="font-bold text-primary-heading">
          {formatAdminId("ESC", row.escrowId)}
        </span>
      ),
    },
    {
      header: "Order ID",
      render: (row) => (
        <span className="font-medium text-description-text">
          {formatAdminId("ORD", row.orderId)}
        </span>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-bold text-primary-heading">
          <CurrencyText text={formatCurrency(row.amount, row.currencyCode)} />
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date",
      render: (row) => (
        <span className="font-medium text-description-text">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: "Action",
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setSelectedEscrow(row);
            setIsModalOpen(true);
          }}
          className="cursor-pointer rounded-full bg-primary px-5 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-800"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex w-full items-center justify-between rounded-2xl border border-[#d3f2e1] bg-[#ecf9f2] p-6">
          <div>
            <p className="text-[14px] font-bold uppercase tracking-wider text-primary">
              Total Escrow Hold (USD)
            </p>
            <h1 className="mt-1 text-[32px] font-black text-primary-heading">
              {formatCurrency(data.totalEscrowHoldUsd, "USD")}
            </h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-sm shadow-[#107446]/20">
            <span className="text-[20px] font-bold">$</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-between rounded-2xl border border-[#f9c156]/40 bg-[#f9c156]/10 p-6">
          <div>
            <p className="text-[14px] font-bold uppercase tracking-wider text-[#b8860b]">
              Total Escrow Hold (KHR)
            </p>
            <h1 className="mt-1 text-[32px] font-black text-[#b8860b]">
              <CurrencyText text={formatCurrency(data.totalEscrowHoldKhr, "KHR")} />
            </h1>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white shadow-sm shadow-[#f9c156]/30">
            <span className="text-[26px] font-bold leading-none">៛</span>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-full">
          <EscrowOverviewChart
            period={activePeriod}
            timeline={data.timeline}
            onPeriodChange={(period) => pushFilters({ period, page: 1 })}
          />
        </div>
        <div className="h-full">
          <TotalContractsChart totalContracts={data.totalContracts} />
        </div>
      </section>

      <section className="flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <span className="rounded-full bg-[#ecf9f2] px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-primary">
            All Escrows
          </span>
          <AdminDropdown
            value={activeStatus}
            options={STATUS_OPTIONS}
            onChange={(status) =>
              pushFilters({
                status,
                page: 1,
              })
            }
            className="w-40"
            triggerClassName="h-10 bg-slate-50"
          />
        </div>

        {data.items.length === 0 ? (
          <div className="py-20 text-center text-[14px] font-semibold text-description-text">
            No matching escrow entries found.
          </div>
        ) : (
          <div className="w-full text-center tracking-normal">
            <Table<AdminEscrowListItem>
              data={data.items}
              columns={columns}
              rowKeyField="escrowId"
            />
            <div className="border-t border-slate-100 p-4">
              <Pagination
                currentPage={data.pagination.page}
                totalItems={data.pagination.totalElements}
                itemsPerPage={data.pagination.size}
                onPageChange={(page) => pushFilters({ page })}
              />
            </div>
          </div>
        )}
      </section>

      <EscrowDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={selectedEscrow}
      />
    </div>
  );
}
