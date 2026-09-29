import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

// User-facing create endpoint (POST /request-payments). Separate from the admin
// review service (src/services/admin/requestPayment.service.ts) which only does
// GET on /admin/request-payment — do not merge the two.
export type RequestPaymentType = "WITHDRAW" | "REFUND";

export type CreateRequestPaymentPayload = {
    orderId: string;
    requestType: RequestPaymentType;
    amount: number;
    currencyCode: string;
    reason: string;
};

type RequestPaymentResponse = {
    status: number;
    message: string;
    payload: {
        paymentRequestId: string;
        amount: number;
        reason: string;
        requestType: RequestPaymentType;
        status: string;
        orderId: string;
        requestedBy: string;
        createdAt: string;
    };
    success: boolean;
    timestamp: string;
};

// One of the current user's own payment requests (GET /payment-requests/my).
export type MyRequestPayment = {
    paymentRequestId: string;
    amount: number;
    reason: string;
    requestType: RequestPaymentType;
    status: string;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    requestedBy: string;
};

export function isActiveRequestPaymentStatus(status?: string | null): boolean {
    const normalized = String(status ?? "").toUpperCase();
    return (
        normalized === "PENDING" ||
        normalized === "WAITING_PROOF" ||
        normalized === "APPROVED"
    );
}

type MyRequestPaymentsResponse = {
    status: number;
    message: string;
    payload: MyRequestPayment[];
    success: boolean;
    timestamp: string;
};

// Returns the requests the signed-in user has already submitted. Null-safe:
// any failure resolves to an empty list so callers (e.g. the order detail page)
// never crash and simply fall back to showing the request action.
export async function getMyRequestPaymentsService(): Promise<MyRequestPayment[]> {
    try {
        const headers = await headerToken();

        const res = await fetch(`${env.NEXT_BASE_API_URL}/payment-requests/my`, {
            cache: "no-store",
            headers,
        });

        const data = (await res
            .json()
            .catch(() => null)) as MyRequestPaymentsResponse | null;

        if (!res.ok || !data?.success) {
            return [];
        }

        return data.payload ?? [];
    } catch {
        return [];
    }
}

export async function createRequestPaymentService(
    payload: CreateRequestPaymentPayload,
): Promise<RequestPaymentResponse["payload"]> {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}/payment-requests`, {
        method: "POST",
        headers: {
            ...headers,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    // Success comes back as the standard envelope ({ success, payload, message }).
    // Errors may instead be RFC problem+json ({ title, detail, ... }) or have an
    // empty message, so read every likely field and include the status code.
    const data = (await res.json().catch(() => null)) as
        | (RequestPaymentResponse & {
              detail?: string;
              title?: string;
              error?: string;
          })
        | null;

    if (!res.ok || !data?.success) {
        console.error(
            "Create request-payment failed:",
            res.status,
            JSON.stringify(data),
            "payload:",
            JSON.stringify(payload),
        );
        throw new Error(
            data?.message ||
                data?.detail ||
                data?.title ||
                data?.error ||
                `Failed to submit request (${res.status}). Please try again.`,
        );
    }

    return data.payload;
}
