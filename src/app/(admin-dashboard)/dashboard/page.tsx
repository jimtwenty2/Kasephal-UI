import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getAdminOverview } from "@/services/admin/overview.service";
import type { Activity } from "./../../../types/adminType";
import OverviewStatCard from "./../_components/OverviewStatCard";
import CurrencyText from "../_components/CurrencyText";
import Table, { TableColumn } from "../_components/Table";
import TransactionChart from "./TransactionChart";

const formatFullCurrency = (value: number, currency: "USD" | "KHR" = "USD") => {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0);

  return currency === "KHR" ? `៛${formatted}` : `$${formatted}`;
};

const ACTIVITY_PAGE_SIZE = 5;

type OverviewPageProps = {
  searchParams?: Promise<{
    activityPage?: string;
  }>;
};

function getPageNumber(value?: string) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function getActivityPageHref(page: number) {
  return `/dashboard?activityPage=${page}`;
}

function ActivityPagination({
  currentPage,
  totalItems,
}: {
  currentPage: number;
  totalItems: number;
}) {
  if (totalItems <= ACTIVITY_PAGE_SIZE) return null;

  const totalPages = Math.ceil(totalItems / ACTIVITY_PAGE_SIZE);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startItem = (safeCurrentPage - 1) * ACTIVITY_PAGE_SIZE + 1;
  const endItem = Math.min(safeCurrentPage * ACTIVITY_PAGE_SIZE, totalItems);
  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="border-t border-slate-100 px-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[#3F5876]">
          Showing {startItem} to {endItem} of {totalItems} results
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {safeCurrentPage > 1 ? (
            <Link
              href={getActivityPageHref(safeCurrentPage - 1)}
              className="flex items-center gap-1 text-sm font-medium text-[#3F5876] transition hover:text-[#007A4D]"
            >
              <ChevronLeft size={18} />
              Prev
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-sm font-medium text-[#CBD5E1]">
              <ChevronLeft size={18} />
              Prev
            </span>
          )}

          {visiblePages.map((page) => (
            <Link
              key={page}
              href={getActivityPageHref(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition ${
                page === safeCurrentPage
                  ? "bg-[#007A4D] text-white shadow-sm"
                  : "text-[#3F5876] hover:bg-[#EAF2EF] hover:text-[#007A4D]"
              }`}
            >
              {page}
            </Link>
          ))}

          {safeCurrentPage < totalPages ? (
            <Link
              href={getActivityPageHref(safeCurrentPage + 1)}
              className="flex items-center gap-1 text-sm font-medium text-[#3F5876] transition hover:text-[#007A4D]"
            >
              Next
              <ChevronRight size={18} />
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-sm font-medium text-[#CBD5E1]">
              Next
              <ChevronRight size={18} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const activityColumns: TableColumn<Activity>[] = [
  {
    header: "ACTIVITY",
    render: (row) => (
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${row.iconClassName}`}
        >
          {row.icon}
        </div>

        <span className=" text-primary-heading">{row.type}</span>
      </div>
    ),
  },
  {
    header: "DETAIL/REFERENCE",
    render: (row) => (
      <div>
        <p className="font-bold text-primary-heading">{row.name}</p>
        <p className="sub-title text-primary-heading">{row.subtitle}</p>
      </div>
    ),
  },
  {
    header: "AMOUNT/USER",
    render: (row) => (
      <span
        className={`font-semibold ${
          row.amountClassName ?? "text-description-text"
        }`}
      >
        {row.amount}
      </span>
    ),
  },
  {
    header: "TIME",
    render: (row) => (
      <span className="text-description-text">{row.time}</span>
    ),
  },
  {
    header: "ACTION",
    render: (row) => {
      const routeMap = {
        "ID Verification": "/identity-verification",
        "Escrow Release": "/escrow-management",
        "Escrow Released": "/escrow-management",
        "Dispute Raised": "/report-management",
      };
      const targetHref =
        routeMap[row.type as keyof typeof routeMap] || "/escrow-management";

      return (
        <Link
          href={targetHref}
          className="inline-block cursor-pointer rounded-full bg-[#107446] px-5 py-2 text-center text-m font-bold text-white transition-colors hover:bg-[#0d633c]"
        >
          {row.action || "Review"}
        </Link>
      );
    },
  },
];

export default async function OverviewPage({ searchParams }: OverviewPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedActivityPage = getPageNumber(
    resolvedSearchParams?.activityPage,
  );
  const { statCards, financials, chartDataByRange, recentActivities } =
    await getAdminOverview();
  const totalActivityPages = Math.max(
    1,
    Math.ceil(recentActivities.length / ACTIVITY_PAGE_SIZE),
  );
  const activityPage = Math.min(requestedActivityPage, totalActivityPages);
  const activityStartIndex = (activityPage - 1) * ACTIVITY_PAGE_SIZE;
  const paginatedRecentActivities = recentActivities.slice(
    activityStartIndex,
    activityStartIndex + ACTIVITY_PAGE_SIZE,
  );

  return (
    <main className="min-h-screen bg-white px-4 py-5 sm:px-6">
      <div className="mx-auto w-full max-w-[1500px]">
        <section
          aria-label="Platform metrics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4"
        >
          {statCards.map((stat) => (
            <OverviewStatCard key={stat.title} {...stat} />
          ))}
        </section>

        <section
          aria-label="Financial overview"
          className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]"
        >
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-[#107446] p-5 text-white shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-white/80">
                TOTAL ESCROW HOLDING
              </p>
              <h2 className="mt-2 break-words text-3xl font-bold leading-tight">
                {formatFullCurrency(financials.totalEscrowHoldingUsd ?? 0, "USD")}
              </h2>
              <p className="mt-1 break-words text-xl font-bold leading-tight text-secondary">
                <CurrencyText
                  text={formatFullCurrency(financials.totalEscrowHoldingKhr ?? 0, "KHR")}
                />
              </p>
              <p className="mt-5 text-base leading-6 text-white/80">
                Secure platform liquidity monitoring and active escrow
                management
              </p>
              <Link
                href="/escrow-management"
                role="button"
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full bg-white px-5 py-2 text-m font-bold text-[#107446] transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#107446]"
              >
                Escrow Management
              </Link>
            </div>

            <div className="rounded-xl bg-[#107446] p-5 text-white shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-white/80">
                AVAILABLE LIQUIDITY
              </p>
              <h2 className="mt-2 break-words text-3xl font-bold leading-tight">
                {formatFullCurrency(financials.availableLiquidityUsd ?? 0, "USD")}
              </h2>
              <p className="mt-1 break-words text-xl font-bold leading-tight text-secondary">
                <CurrencyText
                  text={formatFullCurrency(financials.availableLiquidityKhr ?? 0, "KHR")}
                />
              </p>
            </div>
          </div>

          <TransactionChart chartDataByRange={chartDataByRange} />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="px-6 py-5">
            <h2 className="title font-bold text-primary-heading">
              Recent Activity requiring action
            </h2>
          </div>
          <Table
            data={paginatedRecentActivities}
            columns={activityColumns}
            rowKeyField="id"
          />
          <ActivityPagination
            currentPage={activityPage}
            totalItems={recentActivities.length}
          />
        </section>
      </div>
    </main>
  );
}