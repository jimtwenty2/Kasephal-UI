"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import PaginationComponent from "@/components/action-components/PaginationComponent";
import AdminAvatar from "../../_components/AdminAvatar";
import AdminDropdown from "../../_components/AdminDropdown";
import type {
  AdminPaymentRequestStatus,
  AdminPaymentRequestType,
  AdminRequestPaymentItem,
  AdminRequestPaymentList,
} from "@/types/admin/requestPayment";
import {
  REQUEST_TYPE_TABS,
  REQUEST_TYPE_TAB_LABEL,
  PARTY_COLUMN_LABEL,
  ITEMS_PER_PAGE,
  PaymentStatusBadge,
  formatCurrency,
  formatDateTime,
  formatOrderDisplayId,
  formatRequestDisplayId,
} from "./ShareComponent";

type StatusFilter = "ALL" | AdminPaymentRequestStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "WAITING_PROOF", label: "Waiting Proof" },
  { value: "SUCCESS", label: "Paid" },
  { value: "FAILED", label: "Failed" },
];

interface PaymentRequestTableProps {
  data: AdminRequestPaymentList;
  activeType: AdminPaymentRequestType;
  statusFilter: StatusFilter;
}

function getPartyUser(
  request: AdminRequestPaymentItem,
  activeType: AdminPaymentRequestType,
) {
  const isWithdraw = activeType === "WITHDRAW";
  const party = isWithdraw ? request.farmer : request.buyer;
  const role = isWithdraw ? "FARMER" : "BUYER";
  const name =
    party?.name ??
    party?.fullName ??
    (isWithdraw ? request.farmerName : request.buyerName) ??
    request.requesterName;
  const profileUrl =
    party?.profileUrl ??
    (isWithdraw ? request.farmerProfileUrl : request.buyerProfileUrl) ??
    request.requesterProfileUrl;

  return { name, profileUrl, role };
}

function StatusFilterDropdown({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <AdminDropdown
      value={value}
      options={STATUS_FILTER_OPTIONS}
      onChange={onChange}
      className="w-[180px]"
      triggerClassName="h-10"
    />
  );
}

export default function PaymentRequestTable({
  data,
  activeType,
  statusFilter,
}: PaymentRequestTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const partyHeader = PARTY_COLUMN_LABEL[activeType];

  const pushFilters = useCallback(
    ({
      requestType = activeType,
      status = statusFilter,
      page = 1,
    }: {
      requestType?: AdminPaymentRequestType;
      status?: StatusFilter;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("requestType", requestType);
      params.set("page", String(page));

      if (status === "ALL") {
        params.delete("status");
      } else {
        params.set("status", status);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [activeType, pathname, router, searchParams, statusFilter],
  );

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex gap-1 border-b border-stone-100 bg-[rgba(240,245,235,1)] px-6 pt-4">
        {REQUEST_TYPE_TABS.map((type) => {
          const active = activeType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => pushFilters({ requestType: type, page: 1 })}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-primary-heading transition-colors ${
                active
                  ? "-mb-px border-b-2 border-emerald-700 text-green-700"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {REQUEST_TYPE_TAB_LABEL[type]}
              
            </button>
          );
        })}
      </div>

      <div className="flex justify-start border-b border-stone-100 px-6 py-3">
        <StatusFilterDropdown
          value={statusFilter}
          onChange={(status) => pushFilters({ status, page: 1 })}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-y border-stone-100 bg-[rgba(240,245,235,0.5)] text-left text-sub-title uppercase tracking-wider text-dark-grey">
              <th className="w-[13%] px-6 py-3">Request ID</th>
              <th className="w-[21%] px-6 py-3">{partyHeader}</th>
              <th className="w-[17%] px-6 py-3">Order</th>
              <th className="w-[13%] px-6 py-3">Amount</th>
              <th className="w-[17%] px-6 py-3">Date</th>
              <th className="w-[11%] px-6 py-3">Status</th>
              <th className="w-[8%] px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {data.items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-sm text-stone-400"
                >
                  No {partyHeader.toLowerCase()} requests found.
                </td>
              </tr>
            ) : (
              data.items.map((request) => {
                const partyUser = getPartyUser(request, activeType);

                return (
                  <tr
                    key={request.requestId}
                    className="transition-colors hover:bg-stone-50/60"
                  >
                    <td className="px-6 py-3.5 font-medium text-stone-700">
                      {formatRequestDisplayId(request.requestId)}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <AdminAvatar
                          src={partyUser.profileUrl}
                          name={partyUser.name}
                        />
                        <div>
                          <p className="font-medium text-stone-800">
                            {partyUser.name}
                          </p>
                          <p className="text-xs text-stone-400">
                            {partyUser.role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="truncate px-6 py-3.5 text-stone-500">
                      {formatOrderDisplayId(request.orderId)}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-stone-800">
                      {formatCurrency(request.amount, request.currencyCode)}
                    </td>
                    <td className="px-6 py-3.5 text-stone-500">
                      {formatDateTime(request.submittedAt)}
                    </td>
                    <td className="px-6 py-3.5">
                      <PaymentStatusBadge status={request.status} />
                    </td>
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/request-payment-management/${request.requestId}`}
                        className="inline-block rounded-md bg-[rgba(0,107,39,1)] px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PaginationComponent
        currentPage={data.pagination.page}
        totalItems={data.pagination.totalElements}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={(page) => pushFilters({ page })}
        pageBase={1}
        size="sm"
        className="rounded-t-none border-x-0 border-b-0 shadow-none"
      />
    </div>
  );
}
