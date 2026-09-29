import ReportManagement from "./_components/ReportManagementClient";
import { getAdminReportManagement } from "@/services/admin/report.service";
import type {
  AdminReportIssueStatus,
  AdminReportIssueType,
} from "@/types/admin/report";
import { ITEMS_PER_PAGE } from "./_components/ShareComponent";

interface ReportManagementPageProps {
  searchParams?: Promise<{
    status?: string;
    issueType?: string;
    page?: string;
  }>;
}

const STATUSES: AdminReportIssueStatus[] = [
  "PENDING",
  "WAITING_PROOF",
  "APPROVED",
  "REJECTED",
];

const ISSUE_TYPES: AdminReportIssueType[] = [
  "CONTRACT",
  "DELIVERY",
  "ESCROW_PAYMENT",
  "VIOLATION_TERMS",
  "OTHER",
];

function parseStatus(value?: string): AdminReportIssueStatus | undefined {
  return STATUSES.includes(value as AdminReportIssueStatus)
    ? (value as AdminReportIssueStatus)
    : undefined;
}

function parseIssueType(value?: string): AdminReportIssueType | undefined {
  return ISSUE_TYPES.includes(value as AdminReportIssueType)
    ? (value as AdminReportIssueType)
    : undefined;
}

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function ReportManagementPage({
  searchParams,
}: ReportManagementPageProps) {
  const params = await searchParams;
  const status = parseStatus(params?.status);
  const issueType = parseIssueType(params?.issueType);
  const page = parsePage(params?.page);

  const reportManagement = await getAdminReportManagement({
    status,
    issueType,
    page,
    size: ITEMS_PER_PAGE,
  });

  return (
    <div className="flex min-h-screen">
      <main className="flex-1 overflow-y-auto p-8">
        <ReportManagement
          data={reportManagement}
          activeStatus={status ?? "All"}
          activeIssueType={issueType ?? "All"}
        />
      </main>
    </div>
  );
}
