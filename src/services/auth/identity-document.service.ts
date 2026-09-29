import {
  IdentityDocumentRequest,
  IdentityDocumentResponse,
} from "@/types/auth/identity.type";
import headerToken from "@/lib/headerToken";
import { ApiErrorResponse, ApiValidationError } from "@/types/auth/api-error";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

export async function uploadIdentityDocumentService(
  request: IdentityDocumentRequest,
  profileSetupToken?: string,
): Promise<IdentityDocumentResponse> {
  const headers = profileSetupToken
    ? {
        Authorization: `Bearer ${profileSetupToken}`,
        "Content-Type": "application/json",
      }
    : {
        ...(await headerToken()),
      };

  const res = await fetch(`${apiBaseUrl}/identity-documents`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
    cache: "no-store",
  });

  const data: IdentityDocumentResponse | ApiErrorResponse = await res.json();

  if (!res.ok) {
    throw new ApiValidationError(
      data as ApiErrorResponse,
      "Upload Identity Document failed. Please try again.",
    );
  }

  return data as IdentityDocumentResponse;
}
type FileResponse = {
  fileName: string;
  fileSize: string;
  fileUrl: string;
};
type UploadResponse = {
  status: number;
  message: string;
  payload: FileResponse[];
  success: boolean;
  timestamp: string;
};

type SkipIdentityVerificaitonResponse = {
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
};

export async function skipIdentityVerificationService(
  profileSetupToken: string,
): Promise<string> {
  const res = await fetch(`${apiBaseUrl}/identity-documents/skip`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${profileSetupToken}`,
    },
  });

  const data: SkipIdentityVerificaitonResponse | ApiErrorResponse = await res.json();

  if (!res.ok) {
    throw new ApiValidationError(
      data as ApiErrorResponse,
      "Skip Identity Verification failed. Please try again.",
    );
  }

  return (data as SkipIdentityVerificaitonResponse).message;
}

export async function uploadFileService(
  file: File,
  profileSetupToken: string,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${apiBaseUrl}/uploads/attachment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${profileSetupToken}`,
    },
    body: formData,
    cache: "no-store",
  });

  const data: UploadResponse | ApiErrorResponse = await res.json();

  if (!res.ok) {
    throw new ApiValidationError(
      data as ApiErrorResponse,
      "Login failed. Please try again.",
    );
  }
  const successData = data as UploadResponse;
  const uploadedFile = successData.payload[0];

  if (!uploadedFile?.fileName) {
    throw new Error("Upload succeeded but fileName was not returned.");
  }

  return uploadedFile.fileName;
}
