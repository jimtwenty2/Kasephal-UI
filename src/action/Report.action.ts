"use server";

import { revalidatePath } from "next/cache";
import {
    createReportService,
    submitReportProof,
} from "@/services/Report.service";
import type { IssueType } from "@/types/report";

type CreateReportInput = {
    title: string;
    description: string;
    issueType: IssueType;
    orderId: string;
    reportedUserId: string;
    attachmentUrls: string[];
};

export async function createReportAction(
    input: CreateReportInput
): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        await createReportService(input);
        return { success: true, message: "Report submitted successfully." };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Something went wrong.";
        return { success: false, error: message };
    }
}

// Submits already-uploaded proof files (by file name) for a report in one call.
// The backend accepts this only while the report is WAITING_PROOF and then flips
// it to PENDING, so the reporter can submit proof only once per admin request.
export async function addReportProofAction(
    reportId: string,
    fileNames: string[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const cleaned = fileNames.filter((name) => name && name.trim());

        if (cleaned.length === 0) {
            return { success: false, error: "At least one proof image is required." };
        }

        await submitReportProof(reportId, cleaned);

        revalidatePath(`/report/${reportId}`);
        return { success: true };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Failed to upload proof.";
        return { success: false, error: message };
    }
}