"use server";

import {
    getMyIdentityDocumentStatusService,
    IdentityDocumentPayload,
    uploadIdentityDocumentService
} from "@/services/Identitydocument.service";

export async function uploadIdentityDocumentAction(
    payload: IdentityDocumentPayload
) {
    try {
        const data = await uploadIdentityDocumentService(payload);
        return { success: true, data, error: null };
    } catch (error) {
        return {
            success: false,
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Upload identity document failed",
        };
    }
}

export async function getMyIdentityDocumentStatusAction() {
    try {
        const data = await getMyIdentityDocumentStatusService();
        return { success: true, data, error: null };
    } catch (error) {
        return {
            success: false,
            data: null,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch identity document status",
        };
    }
}
