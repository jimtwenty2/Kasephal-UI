"use server";

import {
    createRequestPaymentService,
    type RequestPaymentType,
} from "@/services/requestPayment.service";
import {
    checkAdminPaymentRequestTransaction,
    reviewAdminPaymentRequest,
} from "@/services/admin/requestPayment.service";
import type {
    AdminPaymentRequestStatus,
    AdminReviewedPaymentRequest,
} from "@/types/admin/requestPayment";

type CreateRequestPaymentInput = {
    orderId: string;
    requestType: RequestPaymentType;
    amount: number;
    currencyCode: string;
    reason: string;
};

export async function createRequestPaymentAction(
    input: CreateRequestPaymentInput,
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        await createRequestPaymentService(input);
        return { success: true, message: "Request submitted successfully." };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong.";
        return { success: false, error: message };
    }
}

type ReviewPaymentRequestInput = {
    requestId: string;
    status: AdminPaymentRequestStatus;
    note: string;
};

// Admin approve/reject a withdraw or refund request. On approval the returned
// payload carries the activePayment (KHQR string) the admin scans to pay out.
export async function reviewPaymentRequestAction(
    input: ReviewPaymentRequestInput,
): Promise<{
    success: boolean;
    data?: AdminReviewedPaymentRequest;
    error?: string;
}> {
    if (!input.requestId) {
        return { success: false, error: "Missing request reference." };
    }

    try {
        const data = await reviewAdminPaymentRequest(
            input.requestId,
            input.status,
            input.note,
        );
        return { success: true, data };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong.";
        return { success: false, error: message };
    }
}

// Poll the admin payout against Bakong by its md5. Tolerant by design: while the
// admin hasn't paid yet the service throws (transaction not found), which here
// just means "not settled" — so the catch resolves quietly instead of surfacing
// an error every poll. Settled once the request flips to SUCCESS / payout PAID.
export async function checkPaymentRequestTransactionAction(
    md5: string,
): Promise<{
    success: boolean;
    settled: boolean;
    status?: string;
    error?: string;
}> {
    if (!md5) {
        return {
            success: false,
            settled: false,
            error: "Missing payment reference.",
        };
    }

    try {
        const data = await checkAdminPaymentRequestTransaction(md5);
        const settled =
            data.status === "SUCCESS" || data.activePayment?.status === "PAID";
        return { success: true, settled, status: data.status };
    } catch {
        return { success: false, settled: false };
    }
}
