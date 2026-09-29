"use client";

import Link from "next/link";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import PaginationComponent from "@/components/action-components/PaginationComponent";
import type {
  AdminReportIssue,
  AdminReportPagination,
} from "@/types/admin/report";
import {
  STATUS_TABS,
  STATUS_TAB_LABEL,
  ITEMS_PER_PAGE,
  IssueTypeBadge,
  StatusBadge,
  formatDate,
  formatReportDisplayId,
  type StatusTab,
  type IssueTypeFilterValue,
} from "./ShareComponent";
import IssueTypeFilter from "./IssueTypeFilterComponent";

interface ReportTableProps {
  reports: AdminReportIssue[];
  userNames: Record<string, string>;
  pagination: AdminReportPagination;
  activeStatus: StatusTab;
  activeIssueType: IssueTypeFilterValue;
}

export default function ReportTable({
  reports,
  userNames = {},
  pagination,
  activeStatus,
  activeIssueType,
}: ReportTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getUserName = (id: string): string => userNames?.[id] ?? id;

  const pushFilters = useCallback(
    ({
      status = activeStatus,
      issueType = activeIssueType,
      page = 1,
    }: {
      status?: StatusTab;
      issueType?: IssueTypeFilterValue;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(page));

      if (status === "All") params.delete("status");
      else params.set("status", status);

      if (issueType === "All") params.delete("issueType");
      else params.set("issueType", issueType);

      router.push(`${pathname}?${params.toString()}`);
    },
    [activeIssueType, activeStatus, pathname, router, searchParams],
  );

  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pt-1">
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => pushFilters({ status: tab, page: 1 })}
              className={`relative px-5 py-2 text-[14px] font-bold transition-colors ${
                activeStatus === tab
                  ? "text-primary-heading"
                  : "text-description-text hover:text-primary-heading"
              }`}
            >
              {STATUS_TAB_LABEL[tab]}
              {activeStatus === tab && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-green-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="mb-3 mt-3 pb-2">
          <IssueTypeFilter
            value={activeIssueType}
            onChange={(value) => pushFilters({ issueType: value, page: 1 })}
          />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-[rgba(239,245,239,1)] text-left text-[12px] font-bold uppercase tracking-wider text-description-text">
              <th className="px-6 py-3">No.</th>
              <th className="px-6 py-3">Report</th>
              <th className="px-6 py-3">Issue Type</th>
              <th className="px-6 py-3">Reporter</th>
              <th className="px-6 py-3">Reported</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-[14px] font-medium text-description-text"
                >
                  No reports match the current filters.
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr
                  key={report.report_issue_id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-6 py-3.5 text-[14px] font-medium text-description-text">
                    {(pagination.page - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="max-w-sm">
                      <p className="text-[14px] font-bold text-primary-heading">
                        {formatReportDisplayId(report.report_issue_id)}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[12px] font-medium text-description-text">
                        {report.title}
                      </p>
                      {report.attachments.length > 0 && (
                        <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-medium text-description-text">
                          <PaperClipIcon className="h-3 w-3" />
                          {report.attachments.length} attachment
                          {report.attachments.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <IssueTypeBadge type={report.issue_type} />
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="text-[14px] font-bold text-primary-heading">
                      {getUserName(report.reporter_id)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[14px] font-medium text-description-text">
                    {getUserName(report.reported_user_id)}
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-6 py-3.5 text-[14px] font-medium text-description-text">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-6 py-3.5">
                    <Link
                      href={`/report-management/${report.report_issue_id}`}
                      className="inline-flex min-h-9 items-center justify-center rounded-full bg-emerald-800 px-5 py-1.5 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationComponent
        currentPage={pagination.page}
        totalItems={pagination.totalElements}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={(page) => pushFilters({ page })}
        pageBase={1}
        size="sm"
        className="rounded-t-none border-x-0 border-b-0 bg-[rgba(239,245,239,1)] shadow-none"
      />
    </div>
  );
}
