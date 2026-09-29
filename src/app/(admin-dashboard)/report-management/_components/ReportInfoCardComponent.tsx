import type { AdminReportIssueStatus } from "@/types/admin/report";
import {
  STATUS_LABEL,
  STATUS_TAB_LABEL,
  formatDate,
  formatReportDisplayId,
} from "./ShareComponent";

interface ReportInfoCardProps {
  reportId: string;
  status: AdminReportIssueStatus;
  createdAt: string;
}

export default function ReportInfoCard({ reportId, status, createdAt }: ReportInfoCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          Report ID
        </p>
        <p className="text-sm font-bold text-stone-900">
          {formatReportDisplayId(reportId)}
        </p>
      </div>
      <p className={`mt-2 text-sm font-semibold ${STATUS_TAB_LABEL[status]}`}>
        {STATUS_LABEL[status]}
      </p>
      <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
        <p className="text-xs text-stone-400">created</p>
        <p className="text-xs font-medium text-stone-600">{formatDate(createdAt)}</p>
      </div>
    </div>
  );
}
