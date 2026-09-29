"use client";

import type {
  AdminReportIssueStatus,
  AdminReportIssueType,
  AdminReportManagement,
} from "@/types/admin/report";
import ReportStats from "./ReportStatsComponent";
import ReportTable from "./ReportTableComponent";
import type { IssueTypeFilterValue, StatusTab } from "./ShareComponent";

interface ReportManagementClientProps {
  data: AdminReportManagement;
  activeStatus: StatusTab;
  activeIssueType: IssueTypeFilterValue;
}

export default function ReportManagement({
  data,
  activeStatus,
  activeIssueType,
}: ReportManagementClientProps) {
  return (
    <>
      <ReportStats
        total={data.stats.total}
        pending={data.stats.pending + data.stats.proof}
        approved={data.stats.approved}
        rejected={data.stats.rejected}
      />
      <ReportTable
        reports={data.items ?? []}
        userNames={data.userNames ?? {}}
        pagination={data.pagination}
        activeStatus={activeStatus as "All" | AdminReportIssueStatus}
        activeIssueType={activeIssueType as "All" | AdminReportIssueType}
      />
    </>
  );
}
