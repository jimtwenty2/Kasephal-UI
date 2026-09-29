import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import { ApiValidationError,ApiErrorResponse } from "@/types/auth/api-error";
export type DocumentType = "ID_CARD" | "PASSPORT";

export interface IdentityDocumentPayload {
    documentType: DocumentType;
    frontImageUrl: string;
    backImageUrl: string;
}

export interface IdentityDocumentResponse {
    id: string;
    documentType: string;
    frontImageUrl: string;
    backImageUrl: string;
    status: string;
    createdAt: string;
}

export type IdentityDocumentVerificationStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "SKIPPED"
    | "NOT_SUBMITTED";

export interface IdentityDocumentStatusResponse {
    identityDocumentId?: string;
    documentType?: DocumentType | string;
    status: IdentityDocumentVerificationStatus | string;
    rejectionReason?: string | null;
    submittedAt?: string;
    updatedAt?: string;
    hasDocument?: boolean;
    isVerifiedIdentity?: boolean;
}

export async function uploadIdentityDocumentService(
    payload: IdentityDocumentPayload
): Promise<IdentityDocumentResponse> {
    const headers = await headerToken();

    const response = await fetch(
        `${env.NEXT_BASE_API_URL}/identity-documents`,
        {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    const result = await response.json();

      if (!response.ok) {
        throw new ApiValidationError(
          result as ApiErrorResponse,
          "Upload Identity Document failed. Please try again.",
        );
      }

    return result.payload ?? result;
}

export async function getMyIdentityDocumentStatusService(): Promise<IdentityDocumentStatusResponse | null> {
    const headers = await headerToken();

    const response = await fetch(
        `${env.NEXT_BASE_API_URL}/identity-documents/me/status`,
        {
            method: "GET",
            headers,
            cache: "no-store",
        }
    );

    if (response.status === 404) {
        return {
            status: "NOT_SUBMITTED",
            hasDocument: false,
            isVerifiedIdentity: false,
        };
    }

    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            result?.message ??
            result?.detail ??
            "Failed to fetch identity document status."
        );
    }

    return result?.payload ?? result ?? null;
}
