import type { AdminReportIssueType } from "@/types/admin/report";
import { ISSUE_TYPE_LABEL } from "./ShareComponent";

interface ReportContentProps {
  issueType: AdminReportIssueType;
  title: string;
  description: string;
}

const BADGE_STYLES: Record<AdminReportIssueType, string> = {
  CONTRACT: "border-blue-200 bg-blue-50 text-blue-700",
  DELIVERY: "border-red-200 bg-red-50 text-red-600",
  ESCROW: "border-purple-200 bg-purple-50 text-purple-700",
  ESCROW_PAYMENT: "border-purple-200 bg-purple-50 text-purple-700",
  VIOLATION_TERMS: "border-red-200 bg-red-50 text-red-600",
  OTHER: "border-stone-200 bg-stone-50 text-stone-700",
};

export default function ReportContent({ issueType, title, description }: ReportContentProps) {
  return (
    <section className="mt-6">
      <span
        className={`inline-flex items-center rounded-full border px-4 py-1 text-sm font-semibold ${BADGE_STYLES[issueType]}`}
      >
        {ISSUE_TYPE_LABEL[issueType]} Issue
      </span>
      <h2 className="mt-4 text-xl font-bold text-stone-900">{title}</h2>
      <div className="mt-3 rounded-xl bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
        {description}
      </div>
    </section>
  );
}
