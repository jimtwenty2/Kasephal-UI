// Mirrors the backend Java enum: public enum IssueType
export type IssueType =
    | "CONTRACT"
    | "ESCROW_PAYMENT"
    | "DELIVERY"
    | "VIOLATION_TERMS"
    | "OTHER";

export type ReportStatus =
    | "PENDING"
    | "WAITING_PROOF"
    | "APPROVED"
    | "REJECTED";

export type ReportFormValues = {
    issueType: string;
    customIssue?: string;
    reportTitle: string;
    description: string;
};

// A single report as returned by the public reports endpoints
// (POST /reports, GET /reports?orderId=…, GET /reports/{id}).
export type ReportDetail = {
    reportIssueId: string;
    title: string;
    description: string;
    issueType: IssueType;
    status: ReportStatus;
    orderId: string;
    reporterId: string;
    reporterName: string;
    reporterProfileUrl: string | null;
    reportedUserId: string;
    reportedUserName: string;
    reportedUserProfileUrl: string | null;
    attachments: string[];
    createdAt: string;
};

// Standard API envelope wrapping every reports response.
export type ReportApiResponse<T> = {
    status: number;
    message: string;
    payload: T;
    success: boolean;
    timestamp: string;
};