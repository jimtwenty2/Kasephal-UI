import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

export type PaymentStatus = "PENDING" | "PAID" | "SUCCESS" | "FAILED";
export type PaymentCurrencyCode = "USD" | "KHR";

export type Payment = {
    paymentId: string;
    amount: number;
    qrString: string;
    md5: string;
    deepLink: string;
    status: PaymentStatus;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
    orderId: string;
    paidBy: string;
};

export type PaymentResponse = {
    status: number;
    message: string;
    payload: Payment;
    success: boolean;
    timestamp: string;
};

type PaymentsResponse = {
    status: number;
    message: string;
    payload: Payment[];
    success: boolean;
    timestamp: string;
    detail?: string;
    title?: string;
};

// Older backend versions returned the raw Bakong result from check-transaction.
// Keep this shape so the client remains tolerant while the current backend
// returns PaymentResponse in the standard API envelope.
export type BakongResponse = {
    responseCode?: number;
    responseMessage?: string;
    errorCode?: number | null;
    data?: unknown;
    status?: string;
    paymentStatus?: string;
    transactionStatus?: string;
};

export type BakongCheckResponse = {
    status: number;
    message: string;
    payload: Payment | BakongResponse;
    success: boolean;
    timestamp: string;
};

export type PaymentResult = {
    success: boolean;
    error?: string;
    data?: Payment;
};

export type PaymentCheckResult = {
    success: boolean;
    error?: string;
    // true once Bakong confirms the transaction has settled.
    settled: boolean;
    status?: string;
};

export type CreatePaymentInput = {
    orderId: string;
    amountToPay: number;
    currencyCode: PaymentCurrencyCode;
};

function getStatusValue(value: unknown): string | undefined {
    if (!value || typeof value !== "object") return undefined;

    const source = value as Record<string, unknown>;
    const directStatus =
        source.status ?? source.paymentStatus ?? source.transactionStatus;

    if (typeof directStatus === "string") return directStatus.toUpperCase();

    return undefined;
}

function getResponseCode(value: unknown): number | undefined {
    if (!value || typeof value !== "object") return undefined;

    const responseCode = (value as Record<string, unknown>).responseCode;

    return typeof responseCode === "number" ? responseCode : undefined;
}

function getNestedData(value: unknown): unknown {
    if (!value || typeof value !== "object") return undefined;

    return (value as Record<string, unknown>).data;
}

function hasPaidStatus(value: unknown): boolean {
    const status = getStatusValue(value);

    if (status === "PAID" || status === "SUCCESS") return true;

    if (!value || typeof value !== "object") return false;

    const source = value as Record<string, unknown>;

    return Object.values(source).some((nestedValue) => {
        if (!nestedValue || typeof nestedValue !== "object") return false;

        return hasPaidStatus(nestedValue);
    });
}

// POST /payment — create a KHQR payment for the order's remaining balance.
export async function createPaymentService(
    input: CreatePaymentInput,
): Promise<PaymentResult> {
    try {
        const headers = await headerToken();

        const res = await fetch(`${env.NEXT_BASE_API_URL}/payment`, {
            method: "POST",
            cache: "no-store",
            headers,
            body: JSON.stringify(input),
        });

        // Errors come back as RFC problem+json ({ title, detail, ... }),
        // success as the standard envelope ({ success, payload, message }).
        const data = (await res.json().catch(() => null)) as
            | (PaymentResponse & { detail?: string; title?: string })
            | null;

        if (!res.ok || !data?.success || !data.payload) {
            return {
                success: false,
                error:
                    data?.message ??
                    data?.detail ??
                    data?.title ??
                    `Failed to create payment (${res.status}).`,
            };
        }

        return { success: true, data: data.payload };
    } catch (error) {
        console.error("Create payment API error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to create payment.",
        };
    }
}

// DELETE /payment/{paymentId} — cancel a still-PENDING payment (creator only).
// Used to force a fresh QR since POST /payment is idempotent per order.
export async function cancelPaymentService(
    paymentId: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const headers = await headerToken();

        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/payment/${paymentId}`,
            {
                method: "DELETE",
                cache: "no-store",
                headers,
            },
        );

        const data = (await res.json().catch(() => null)) as
            | { success?: boolean; message?: string; detail?: string; title?: string }
            | null;

        if (!res.ok || data?.success === false) {
            console.error("Cancel payment failed:", res.status, data);
            return {
                success: false,
                error:
                    data?.message ??
                    data?.detail ??
                    data?.title ??
                    `Failed to cancel payment (${res.status}).`,
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Cancel payment API error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to cancel payment.",
        };
    }
}

// POST /payment/check-transaction — ask the backend to reconcile this payment
// against Bakong and persist the result. This is the *trigger*: polling calls it
// before reading the stored status so settlement actually advances. Tolerant of
// the backend's persistence write failing — the live Bakong settled flag is
// still returned so the UI can confirm the buyer paid.
export async function getPaymentsByOrderIdService(
    orderId: string,
): Promise<Payment[]> {
    if (!orderId) return [];

    try {
        const headers = await headerToken();

        const res = await fetch(`${env.NEXT_BASE_API_URL}/payment/order/${orderId}`, {
            method: "GET",
            cache: "no-store",
            headers,
        });

        const data = (await res.json().catch(() => null)) as PaymentsResponse | null;

        if (!res.ok || !data?.success || !Array.isArray(data.payload)) {
            console.error("Get order payments failed:", res.status, data);
            return [];
        }

        return data.payload;
    } catch (error) {
        console.error("Get order payments API error:", error);
        return [];
    }
}

export async function checkPaymentService(
    md5: string,
): Promise<PaymentCheckResult> {
    try {
        const headers = await headerToken();

        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/payment/check-transaction`,
            {
                method: "POST",
                cache: "no-store",
                headers,
                body: JSON.stringify({ md5 }),
            },
        );

        const data = (await res.json().catch(() => null)) as
            | (BakongCheckResponse & { detail?: string; title?: string })
            | null;

        if (!res.ok || !data?.success) {
            console.error("Check payment failed:", res.status, data);
            return {
                success: false,
                settled: false,
                error:
                    data?.message ??
                    data?.detail ??
                    data?.title ??
                    `Failed to check payment (${res.status}).`,
            };
        }

        // Bakong returns responseCode 0 for a found/settled transaction; some API
        // versions also surface PAID/SUCCESS on the payload or nested data.
        const settled =
            getResponseCode(data.payload) === 0 || hasPaidStatus(data.payload);
        const status =
            getStatusValue(data.payload) ?? getStatusValue(getNestedData(data.payload));

        return { success: true, settled, status };
    } catch (error) {
        console.error("Check payment API error:", error);
        return {
            success: false,
            settled: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to check payment.",
        };
    }
}

// GET /payment/{paymentId} - read the payment's stored settlement status.
// The backend keeps this up to date via its own Bakong reconciliation, so this
// avoids a live Bakong round-trip on every poll.
export async function getPaymentStatusService(
    paymentId: string,
): Promise<PaymentCheckResult> {
    try {
        const headers = await headerToken();

        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/payment/${paymentId}`,
            {
                method: "GET",
                cache: "no-store",
                headers,
            },
        );

        // Success comes back as the standard envelope ({ success, payload }),
        // errors as RFC problem+json ({ title, detail, ... }).
        const data = (await res.json().catch(() => null)) as
            | (PaymentResponse & { detail?: string; title?: string })
            | null;

        if (!res.ok || !data?.success || !data.payload) {
            console.error("Get payment status failed:", res.status, data);
            return {
                success: false,
                settled: false,
                error:
                    data?.message ??
                    data?.detail ??
                    data?.title ??
                    `Failed to check payment (${res.status}).`,
            };
        }

        // Settled once the stored status is PAID/SUCCESS.
        const settled = hasPaidStatus(data.payload);
        const status = getStatusValue(data.payload);

        return { success: true, settled, status };
    } catch (error) {
        console.error("Get payment status API error:", error);
        return {
            success: false,
            settled: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to check payment.",
        };
    }
}
