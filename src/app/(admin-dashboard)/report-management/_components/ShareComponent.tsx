import type {
  AdminReportIssueStatus,
  AdminReportIssueType,
} from "@/types/admin/report";

export type StatusTab = "All" | AdminReportIssueStatus;

export const STATUS_TABS: StatusTab[] = [
  "All",
  "PENDING",
  "WAITING_PROOF",
  "APPROVED",
  "REJECTED",
];


export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const STATUS_TAB_LABEL: Record<StatusTab, string> = {
  All: "All",
  PENDING: "Pending",
  WAITING_PROOF: "Proof",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export type IssueTypeFilterValue = "All" | AdminReportIssueType;

export const ISSUE_TYPE_FILTER_OPTIONS: IssueTypeFilterValue[] = [
  "All",
  "CONTRACT",
  "DELIVERY",
  "ESCROW_PAYMENT",
  "VIOLATION_TERMS",
  "OTHER",
];

export const ISSUE_TYPE_LABEL: Record<AdminReportIssueType, string> = {
  CONTRACT: "Contract",
  DELIVERY: "Delivery",
  ESCROW: "Escrow",
  ESCROW_PAYMENT: "Escrow Payment",
  VIOLATION_TERMS: "Violation",
  OTHER: "Other",
};

export type AccountStatus = "ACTIVE" | "WARNING" | "BANNED";

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "Active",
  WARNING: "Warning",
  BANNED: "Banned",
};



export const STATUS_LABEL: Record<AdminReportIssueStatus, string> = {
  PENDING: "Pending",
  WAITING_PROOF: "Proof",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const ITEMS_PER_PAGE = 10;

export function formatReportDisplayId(id: string): string {
  const compactId = id.replace(/-/g, "");
  const suffix = compactId.slice(-4).toUpperCase();

  return `#REP-${suffix || "----"}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function IssueTypeBadge({ type }: { type: AdminReportIssueType }) {
  const styles: Record<AdminReportIssueType, string> = {
    CONTRACT: "bg-blue-100 text-blue-800",
    DELIVERY: "bg-amber-100 text-amber-800",
    ESCROW: "bg-purple-100 text-purple-800",
    ESCROW_PAYMENT: "bg-purple-100 text-purple-800",
    VIOLATION_TERMS: "bg-red-100 text-red-800",
    OTHER: "bg-stone-100 text-stone-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${styles[type]}`}>
      {ISSUE_TYPE_LABEL[type]}
    </span>
  );
}

export function StatusBadge({ status }: { status: AdminReportIssueStatus }) {
  const styles: Record<AdminReportIssueStatus, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    WAITING_PROOF: "bg-blue-50 text-blue-800 border-blue-200",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
