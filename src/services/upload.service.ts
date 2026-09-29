import headerToken from "@/lib/headerToken";
import { env } from "@/lib/env";
import { ApiValidationError,ApiErrorResponse } from "@/types/auth/api-error";

type UploadResponse = {
  success?: boolean;
  message?: string;
  payload?: unknown;
  data?: unknown;
  fileName?: string;
  filename?: string;
  name?: string;
  url?: string;
  imageUrl?: string;
  fileUrl?: string;
};

export type UploadAttachmentResult = {
  success: boolean;
  fileName?: string;
  imageUrl?: string;
  error?: string;
};

export type DeleteFilesResult = {
  success: boolean;
  error?: string;
};

function getBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_BASE_API_URL;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isImageFileName(value: string) {
  return /\.(?:png|jpe?g|webp|gif)$/i.test(value);
}

function getStringPayload(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = getStringPayload(item);

      if (result) return result;
    }

    return undefined;
  }
  if (!isObject(value)) return undefined;

  const candidates = [
    value.fileName,
    value.filename,
    value.file_name,
    value.originalFileName,
    value.storedFileName,
    value.attachmentName,
    value.name,
    value.url,
    value.imageUrl,
    value.fileUrl,
    value.path,
  ];

  const directMatch = candidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.length > 0,
  );

  if (directMatch) return directMatch;

  for (const nestedValue of Object.values(value)) {
    if (typeof nestedValue === "string" && isImageFileName(nestedValue)) {
      return nestedValue;
    }

    if (isObject(nestedValue) || Array.isArray(nestedValue)) {
      const result = getStringPayload(nestedValue);

      if (result) return result;
    }
  }

  return undefined;
}

function toImageUrl(baseUrl: string, value: string) {
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  ) {
    return value;
  }

  if (value.includes("/")) {
    return `${baseUrl}/${value.replace(/^\/+/, "")}`;
  }

  return `${baseUrl}/uploads/view/${encodeURIComponent(value)}`;
}

async function readResponse(res: Response): Promise<UploadResponse> {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as UploadResponse;
  } catch {
    return { payload: text };
  }
}

async function headerTokenWithoutContentType(): Promise<HeadersInit> {
  const headers = await headerToken();
  const normalized = new Headers(headers);

  normalized.delete("Content-Type");

  return normalized;
}

export async function uploadAttachment(
  body: FormData | File,
): Promise<UploadAttachmentResult> {
  const baseUrl = getBaseUrl();

  if (!baseUrl) {
    return { success: false, error: "API base URL is not configured." };
  }

  const formData = body instanceof FormData ? body : new FormData();

  if (!(body instanceof FormData)) {
    formData.append("file", body);
  }

  try {
    const res = await fetch(`${baseUrl}/uploads/attachment`, {
      method: "POST",
      headers: await headerTokenWithoutContentType(),
      body: formData,
    });
    const response = await readResponse(res);

    if (!res.ok) {
      throw new ApiValidationError(
        response as ApiErrorResponse,
        "Upload Identity Document failed. Please try again.",
      );
    }

    const uploadedValue = getStringPayload(
      response.payload ?? response.data ?? response,
    );

    if (!uploadedValue) {
      return {
        success: false,
        error: "Upload response did not include a file name.",
      };
    }

    return {
      success: true,
      fileName: uploadedValue,
      imageUrl: toImageUrl(baseUrl, uploadedValue),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload attachment.",
    };
  }
}

export async function deleteFiles(
  fileNames: string[],
): Promise<DeleteFilesResult> {
  const baseUrl = getBaseUrl();
  const uniqueFileNames = Array.from(
    new Set(fileNames.map((fileName) => fileName.trim()).filter(Boolean)),
  );

  if (uniqueFileNames.length === 0) return { success: true };

  if (!baseUrl) {
    return { success: false, error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${baseUrl}/uploads/delete`, {
      method: "DELETE",
      headers: await headerToken(),
      body: JSON.stringify(uniqueFileNames),
    });
    const response = await readResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        error: response.message ?? "Failed to delete files.",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete files.",
    };
  }
}

export function getDownloadUrl(fileName: string) {
  return `${env.NEXT_BASE_API_URL}/uploads/download/${fileName}`;
}