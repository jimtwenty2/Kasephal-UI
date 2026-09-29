export type AdminReportIssueType =
  | "CONTRACT"
  | "ESCROW"
  | "ESCROW_PAYMENT"
  | "DELIVERY"
  | "VIOLATION_TERMS"
  | "OTHER";

export type AdminReportIssueStatus =
  | "PENDING"
  | "WAITING_PROOF"
  | "APPROVED"
  | "REJECTED";

export type AdminReportResolutionAction = "WARNING" | "BANNED";

export type AdminReportUserRole = "ADMIN" | "GOVERNMENT" | "BUYER" | "FARMER";

export interface AdminReportAttachment {
  report_attachment_id: string;
  report_issue_id: string;
  image_url: string;
}

export interface AdminReportUserDetail {
  user_id: string;
  full_name: string;
  role: AdminReportUserRole | string;
  trusted_score: number;
  verified: boolean;
  avatar_url?: string;
  email: string;
  phone_number: string;
  account_status: string;
  bio?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  profile_status?: string;
  farm_location?: string;
  farm_size?: number;
  medal_type?: string;
  trust_level?: string;
  business_type?: string;
  business_name?: string;
  business_address?: string;
  ministry_address?: string;
}

export interface AdminReportIssue {
  report_issue_id: string;
  report_user_id: string;
  title: string;
  description: string;
  issue_type: AdminReportIssueType;
  status: AdminReportIssueStatus;
  order_id?: string;
  reporter_id: string;
  reported_user_id: string;
  reporter_name?: string;
  reported_user_name?: string;
  attachments: AdminReportAttachment[];
  created_at: string;
  resolution_action?: AdminReportResolutionAction;
  reporter?: AdminReportUserDetail;
  reported?: AdminReportUserDetail;
}

export interface AdminReportStats {
  total: number;
  pending: number;
  proof: number;
  approved: number;
  rejected: number;
}

export interface AdminReportPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AdminReportManagement {
  items: AdminReportIssue[];
  stats: AdminReportStats;
  userNames: Record<string, string>;
  pagination: AdminReportPagination;
}

export interface AdminReportManagementParams {
  status?: AdminReportIssueStatus;
  issueType?: AdminReportIssueType;
  page?: number;
  size?: number;
}

export interface AdminReportApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  payload: T;
  timestamp: string;
}
