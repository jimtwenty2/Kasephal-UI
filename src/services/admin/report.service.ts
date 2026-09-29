import "server-only";

import headerToken from "@/lib/headerToken";
import type {
  AdminReportApiResponse,
  AdminReportIssue,
  AdminReportIssueStatus,
  AdminReportIssueType,
  AdminReportManagement,
  AdminReportManagementParams,
  AdminReportUserDetail,
} from "@/types/admin/report";
import { getUserById } from "@/services/admin/user_management.service";
import { toAdminUser } from "@/lib/adminUserAdapter";
import type { User } from "@/types/admin/userAll";

const API_BASE_URL = process.env.NEXT_BASE_API_URL;

type ReportListPayload = {
  summary: {
    totalReports: number;
    pendingReview: number;
    proof: number;
    approved: number;
    rejected: number;
  };
  items: ReportListItemPayload[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

type ReportListItemPayload = {
  reportIssueId: string;
  reportCode: string | null;
  title: string;
  issueType: AdminReportIssueType;
  reporterName: string | null;
  reportedUserName: string | null;
  status: AdminReportIssueStatus;
  createdAt: string;
  attachmentCount: number;
};

type ReportPartyPayload = {
  userId: string;
  name: string;
  profileUrl: string | null;
  role: string;
  trustScore: number | string | null;
};

type ReportDetailPayload = {
  reportIssueId: string;
  reportCode: string | null;
  workflowStage: string | null;
  title: string;
  description: string;
  issueType: AdminReportIssueType;
  status: AdminReportIssueStatus;
  createdAt: string;
  orderId: string | null;
  orderCode: string | null;
  attachments: string[];
  reporter: ReportPartyPayload;
  reportedUser: ReportPartyPayload;
};

function toNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toIssueType(value: AdminReportIssueType): AdminReportIssueType {
  return value === "ESCROW" ? "ESCROW_PAYMENT" : value;
}

function mapParty(party: ReportPartyPayload): AdminReportUserDetail {
  return {
    user_id: party.userId,
    full_name: party.name,
    role: party.role,
    trusted_score: toNumber(party.trustScore),
    verified: true,
    avatar_url: party.profileUrl ?? undefined,
    email: "N/A",
    phone_number: "N/A",
    account_status: "ACTIVE",
  };
}

function mapListItem(item: ReportListItemPayload): AdminReportIssue {
  const reportIssueId = item.reportIssueId;

  return {
    report_issue_id: reportIssueId,
    report_user_id: item.reportedUserName ?? reportIssueId,
    title: item.title,
    description: "",
    issue_type: toIssueType(item.issueType),
    status: item.status,
    reporter_id: item.reporterName ?? "Reporter",
    reported_user_id: item.reportedUserName ?? "Reported user",
    reporter_name: item.reporterName ?? "Reporter",
    reported_user_name: item.reportedUserName ?? "Reported user",
    attachments: Array.from({ length: item.attachmentCount }, (_, index) => ({
      report_attachment_id: `${reportIssueId}-attachment-${index + 1}`,
      report_issue_id: reportIssueId,
      image_url: "",
    })),
    created_at: item.createdAt,
  };
}

function mapDetail(payload: ReportDetailPayload): AdminReportIssue {
  const reporter = mapParty(payload.reporter);
  const reported = mapParty(payload.reportedUser);

  return {
    report_issue_id: payload.reportIssueId,
    report_user_id: reported.user_id,
    title: payload.title,
    description: payload.description,
    issue_type: toIssueType(payload.issueType),
    status: payload.status,
    order_id: payload.orderCode ?? payload.orderId ?? undefined,
    reporter_id: reporter.user_id,
    reported_user_id: reported.user_id,
    reporter_name: reporter.full_name,
    reported_user_name: reported.full_name,
    attachments: (payload.attachments ?? []).map((url, index) => ({
      report_attachment_id: `${payload.reportIssueId}-attachment-${index + 1}`,
      report_issue_id: payload.reportIssueId,
      image_url: url,
    })),
    created_at: payload.createdAt,
    reporter,
    reported,
  };
}

export async function getAdminReportManagement({
  status,
  issueType,
  page = 1,
  size = 10,
}: AdminReportManagementParams = {}): Promise<AdminReportManagement> {
  const headers = await headerToken();
  const url = new URL(`${API_BASE_URL}/admin/report-management`);

  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));
  if (status) url.searchParams.set("status", status);
  if (issueType) url.searchParams.set("issueType", toIssueType(issueType));

  const res = await fetch(url.toString(), {
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch admin report management");
  }

  const data: AdminReportApiResponse<ReportListPayload> = await res.json();
  const items = data.payload.items.map(mapListItem);

  return {
    items,
    stats: {
      total: data.payload.summary.totalReports,
      pending: data.payload.summary.pendingReview,
      proof: data.payload.summary.proof,
      approved: data.payload.summary.approved,
      rejected: data.payload.summary.rejected,
    },
    userNames: items.reduce<Record<string, string>>((names, report) => {
      names[report.reporter_id] = report.reporter_name ?? report.reporter_id;
      names[report.reported_user_id] =
        report.reported_user_name ?? report.reported_user_id;
      return names;
    }, {}),
    pagination: data.payload.pagination,
  };
}

// The admin report-detail endpoint only returns name/avatar/role/trust for each
// party. Enrich a party with the full account record (email, phone, status,
// profile fields) fetched from GET /users/{id}, leaving the existing "N/A"
// placeholders only when a value is genuinely absent.
function enrichParty(
  base: AdminReportUserDetail,
  user: User | null,
): AdminReportUserDetail {
  if (!user) return base;

  const detail = toAdminUser(user);

  return {
    ...base,
    full_name: base.full_name || detail.name,
    avatar_url: base.avatar_url ?? detail.profile,
    email: detail.email,
    phone_number: detail.phone ?? "N/A",
    account_status: detail.status,
    date_of_birth: detail.dateOfBirth ?? base.date_of_birth,
    place_of_birth: detail.placeOfBirth ?? base.place_of_birth,
    business_type: detail.businessType ?? base.business_type,
    business_name: detail.companyName ?? base.business_name,
    business_address: detail.location ?? base.business_address,
    farm_location: detail.farmLocation ?? base.farm_location,
    farm_size: detail.farmSize ? Number(detail.farmSize) : base.farm_size,
    ministry_address: detail.address ?? base.ministry_address,
  };
}

async function safeGetUser(userId?: string): Promise<User | null> {
  if (!userId) return null;
  try {
    return await getUserById(userId);
  } catch {
    return null;
  }
}

export async function getAdminReportDetail(
  reportIssueId: string,
): Promise<AdminReportIssue> {
  const headers = await headerToken();
  const res = await fetch(
    `${API_BASE_URL}/admin/report-management/${reportIssueId}`,
    {
      headers,
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch admin report detail");
  }

  const data: AdminReportApiResponse<ReportDetailPayload> = await res.json();
  const report = mapDetail(data.payload);

  // Pull the full account record for each party so View Details shows real
  // contact/profile data instead of "N/A". Null-safe per party.
  const [reporterUser, reportedUser] = await Promise.all([
    safeGetUser(report.reporter_id),
    safeGetUser(report.reported_user_id),
  ]);

  if (report.reporter) report.reporter = enrichParty(report.reporter, reporterUser);
  if (report.reported) report.reported = enrichParty(report.reported, reportedUser);

  return report;
}

// ─── Report workflow actions (admin) ────────────────────────────────────────

// Approve / reject a report — PATCH /reports/{id}/status.
export async function updateAdminReportStatus(
  reportIssueId: string,
  status: Extract<AdminReportIssueStatus, "APPROVED" | "REJECTED">,
): Promise<void> {
  const headers = await headerToken();
  const res = await fetch(`${API_BASE_URL}/reports/${reportIssueId}/status`, {
    method: "PATCH",
    headers,
    cache: "no-store",
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    let message = "Failed to update report status";
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
}

// Ask the reporter for more proof — PATCH /reports/{id}/request-proof.
export async function requestReportProof(
  reportIssueId: string,
  message?: string,
): Promise<void> {
  const headers = await headerToken();
  const res = await fetch(
    `${API_BASE_URL}/reports/${reportIssueId}/request-proof`,
    {
      method: "PATCH",
      headers,
      cache: "no-store",
      body: JSON.stringify(message ? { message } : {}),
    },
  );

  if (!res.ok) {
    let errorMessage = "Failed to request proof";
    try {
      const body = await res.json();
      errorMessage = body?.message ?? errorMessage;
    } catch {
      // keep default message
    }
    throw new Error(errorMessage);
  }
}
