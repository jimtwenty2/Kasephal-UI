import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type {
    IssueType,
    ReportApiResponse,
    ReportDetail,
    ReportStatus,
} from "@/types/report";

// A report in any of these states blocks the reporter from filing another
// report on the same order. REJECTED reports do not block (the user may try
// again). APPROVED is terminal: the issue was resolved, so no further reports.
const BLOCKING_REPORT_STATUSES: ReportStatus[] = [
    "PENDING",
    "WAITING_PROOF",
    "APPROVED",
];

export type OrderReportGuard = {
    blocked: boolean;
    report: ReportDetail | null;
};

type CreateReportPayload = {
    title: string;
    description: string;
    issueType: IssueType;
    orderId: string;
    reportedUserId: string;
    attachmentUrls: string[];
};

export async function createReportService(
    payload: CreateReportPayload
): Promise<ReportDetail> {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}/reports`, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data: ReportApiResponse<ReportDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data?.message ?? "Create report failed. Please try again.");
    }

    return data.payload;
}

// Fetches the reports the current user has filed on a given order
// (GET /reports/orders/{orderId}). Scoped to the caller by the backend.
export async function getReportsByOrder(
    orderId: string
): Promise<ReportDetail[]> {
    const headers = await headerToken();

    const res = await fetch(
        `${env.NEXT_BASE_API_URL}/reports/orders/${encodeURIComponent(orderId)}`,
        {
            headers,
            cache: "no-store",
        }
    );

    const data = await res.json();

    if (!res.ok || data?.success === false) {
        throw new Error(data?.message ?? "Failed to load reports for this order.");
    }

    // The endpoint may return the array directly under `payload`, or wrapped in
    // a paginated envelope (`payload.items`). Tolerate both.
    const payload = data?.payload ?? data;

    if (Array.isArray(payload)) return payload as ReportDetail[];
    if (Array.isArray(payload?.items)) return payload.items as ReportDetail[];

    return [];
}

// Decides whether `reporterId` may file a new report on `orderId`, based on the
// statuses of their existing reports. Returns the most recent blocking report
// (if any) so the UI can show its status. Fails open: if the lookup throws, the
// caller should still allow the form — the backend remains the source of truth.
export async function getOrderReportGuard(
    orderId: string,
    reporterId: string
): Promise<OrderReportGuard> {
    const reports = await getReportsByOrder(orderId);

    const blocking = reports
        .filter(
            (report) =>
                report.reporterId === reporterId &&
                BLOCKING_REPORT_STATUSES.includes(report.status)
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    return {
        blocked: blocking.length > 0,
        report: blocking[0] ?? null,
    };
}

// Fetches a single report by its id (GET /reports/{reportIssueId}).
export async function getReportById(
    reportIssueId: string
): Promise<ReportDetail> {
    const headers = await headerToken();

    const res = await fetch(
        `${env.NEXT_BASE_API_URL}/reports/${reportIssueId}`,
        {
            headers,
            cache: "no-store",
        }
    );

    const data: ReportApiResponse<ReportDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data?.message ?? "Failed to load report details.");
    }

    return data.payload;
}

// Submits proof images in response to an admin proof request, in one call
// (POST /reports/{id}/proof). The backend only accepts this while the report is
// WAITING_PROOF, then flips it back to PENDING — so proof can be submitted only
// once per request. Reporter-only.
export async function submitReportProof(
    reportIssueId: string,
    fileNames: string[]
): Promise<ReportDetail> {
    const headers = await headerToken();

    const res = await fetch(
        `${env.NEXT_BASE_API_URL}/reports/${reportIssueId}/proof`,
        {
            method: "POST",
            headers,
            body: JSON.stringify({ fileNames }),
            cache: "no-store",
        }
    );

    const data: ReportApiResponse<ReportDetail> = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data?.message ?? "Failed to submit proof.");
    }

    return data.payload;
}
