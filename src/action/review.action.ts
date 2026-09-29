"use server";

import { rateFarmerService, rateBuyerService } from "@/services/review.service";
import type { CreateReviewPayload } from "@/services/review.service";

export async function rateFarmerAction(payload: CreateReviewPayload) {
    try {
        const result = await rateFarmerService(payload);
        return { success: true, data: result };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to submit review.",
        };
    }
}

export async function rateBuyerAction(payload: CreateReviewPayload) {
    try {
        const result = await rateBuyerService(payload);
        return { success: true, data: result };
    } catch (error) {
        console.error("rateBuyerAction error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to submit review.",
        };
    }
}