import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import { auth } from "@/auth";

export type CriteriaScores = {
    cropQuality?: number;
    contractQuality?: number;
    deliveryPerformance?: number;
    overallRating?: number;
    paymentPromptness?: number;
    easeOfTransaction?: number;
    communication?: number;
};

export type CreateReviewPayload = {
    orderId: string;
    criteriaScores: CriteriaScores;
    feedback: string;
    attachments: string[];
};

export type CreateReviewResponse = {
    status: number;
    message: string;
    payload: {
        reviewId: string;
        reviewType: string;
        overallRating: number;
        criteriaScores: Record<string, number>;
        feedback: string;
        reviewerId: string;
        revieweeId: string;
        orderId: string;
        createdAt: string;
        updatedAt: string;
        attachments: { reviewAttachmentId: string; fileName: string }[];
    };
    success: boolean;
    timestamp: string;
};

type ReviewErrorResponse = Partial<CreateReviewResponse> & {
    detail?: string;
    title?: string;
    error?: string;
    errors?: unknown;
};

async function readReviewResponse(res: Response): Promise<ReviewErrorResponse | null> {
    return res.json().catch(() => null) as Promise<ReviewErrorResponse | null>;
}

function getReviewErrorMessage(data: ReviewErrorResponse | null) {
    if (!data) return "Failed to submit review.";

    if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
    }

    if (typeof data.detail === "string" && data.detail.trim()) {
        return data.detail;
    }

    if (typeof data.title === "string" && data.title.trim()) {
        return data.title;
    }

    if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
    }

    return "Failed to submit review.";
}

export async function rateFarmerService(
    payload: CreateReviewPayload,
): Promise<CreateReviewResponse> {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}/reviews/rate-farmer`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = await readReviewResponse(res);

    if (!res.ok || data?.success === false) {
        throw new Error(getReviewErrorMessage(data));
    }

    return data as CreateReviewResponse;
}

export async function rateBuyerService(
    payload: CreateReviewPayload,
): Promise<CreateReviewResponse> {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}/reviews/rate-buyer`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    });

    const data = await readReviewResponse(res);

    if (!res.ok || data?.success === false) {
        throw new Error(getReviewErrorMessage(data));
    }

    return data as CreateReviewResponse;
}

export type OrderReview = {
    reviewId: string;
    reviewType: string;
    overallRating: number;
    criteriaScores: Record<string, number>;
    feedback: string;
    reviewerId: string;
    revieweeId: string;
    orderId: string;
    createdAt: string;
    updatedAt: string;
    attachments: { reviewAttachmentId: string; fileName: string }[];
};

/**
 * Fetch all reviews submitted for a given order. Returns an empty list on any
 * failure so a transient error never wrongly blocks a legitimate review.
 */
export async function getReviewsByOrderService(
    orderId: string,
): Promise<OrderReview[]> {
    if (!orderId) return [];

    try {
        const headers = await headerToken();
        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/reviews/order/${orderId}`,
            { method: "GET", headers, cache: "no-store" },
        );

        const data = await res.json();

        if (!res.ok || data?.success === false) return [];

        return Array.isArray(data?.payload) ? data.payload : [];
    } catch {
        return [];
    }
}

/**
 * Whether the currently authenticated user has already reviewed this order.
 * A user may review a given order only once (the other party still has their
 * own separate review).
 */
export async function hasCurrentUserReviewedOrderService(
    orderId: string,
): Promise<boolean> {
    if (!orderId) return false;

    try {
        const session = await auth();
        const userId = session?.user?.userId;
        if (!userId) return false;

        const reviews = await getReviewsByOrderService(orderId);
        return reviews.some((review) => review.reviewerId === userId);
    } catch {
        return false;
    }
}
