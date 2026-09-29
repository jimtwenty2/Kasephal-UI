import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import { Crop, CropResponse, CropType, CropTypeResponse } from "@/types/cropType";
import { ApiErrorResponse, ApiValidationError } from "@/types/auth/api-error";

// ─── Response shapes ───────────────────────────────────────────────────────────

type CropTypeMutationResponse = {
  status?: number;
  message?: string;
  payload?: CropType;
  success?: boolean;
};

type CropMutationResponse = {
  status?: number;
  message?: string;
  payload?: Crop;
  success?: boolean;
};

type CropDeleteResponse = {
  status?: number;
  message?: string;
  payload?: Crop | CropType | null;
  success?: boolean;
};

type ProblemDetail = {
  detail?: string;   // specific human-readable explanation  ← this is what we show
  title?: string;    // short HTTP-status summary (e.g. "Conflict")
  status?: number;
  instance?: string;
  timestamp?: string;
  message?: string;  // some endpoints return "message" instead of / in addition to "detail"
};

async function readMutationResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return { success: res.ok } as T;
  return JSON.parse(text) as T;
}

function extractErrorMessage(body: ProblemDetail, fallback: string): string {
  return body.detail ?? body.message ?? body.title ?? fallback;
}

// ─── Crop Types ────────────────────────────────────────────────────────────────

export async function getCropTypesService(): Promise<CropTypeResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crop-types`, {
    method: "GET",
    headers,
    next: { tags: ["crop-types"] },
  });

  const cropTypes: CropTypeResponse = await res.json();

  if (!res.ok) {
    throw new Error(
      cropTypes.message || "Failed to load crop types. Please try again.",
    );
  }

  return cropTypes;
}

export async function createCropTypeService(
  body: { typeName: string },
): Promise<CropTypeMutationResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crop-types`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const result = await readMutationResponse<CropTypeMutationResponse & ProblemDetail>(res);

  if (!res.ok || result.success === false) {
    // Surface the RFC-7807 `detail` field so the caller can show it in a toast
    throw new Error(
      extractErrorMessage(result, "Failed to create crop type. Please try again."),
    );
  }

  return result;
}

export async function updateCropTypeService(
  cropTypeId: string,
  body: { typeName: string },
): Promise<CropTypeMutationResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crop-types/${cropTypeId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  const result = await readMutationResponse<CropTypeMutationResponse & ProblemDetail>(res);

  if (!res.ok || result.success === false) {
    throw new Error(
      extractErrorMessage(result, "Failed to update crop type. Please try again."),
    );
  }

  return result;
}

export async function deleteCropTypeService(
  cropTypeId: string,
): Promise<CropDeleteResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crop-types/${cropTypeId}`, {
    method: "DELETE",
    headers,
  });

  const data = await readMutationResponse<CropDeleteResponse & ProblemDetail & ApiErrorResponse>(res);

  if (!res.ok) {
    const message = extractErrorMessage(
      data as ProblemDetail,
      "Failed to delete crop type. Please try again.",
    );
    throw new ApiValidationError(data as ApiErrorResponse, message);
  }

  return data as CropDeleteResponse;
}

// ─── Crops ─────────────────────────────────────────────────────────────────────

export async function getCropsService(): Promise<CropResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crops`, {
    method: "GET",
    headers,
    next: { tags: ["crops"] },
  });

  const crops: CropResponse = await res.json();

  if (!res.ok) {
    throw new Error(crops.message || "Failed to load crops. Please try again.");
  }

  return crops;
}

export async function createCropService(
  body: { cropName: string; cropTypeId: string },
): Promise<CropMutationResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crops`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const result = await readMutationResponse<CropMutationResponse & ProblemDetail>(res);

  if (!res.ok || result.success === false) {
    throw new Error(
      extractErrorMessage(result, "Failed to create crop. Please try again."),
    );
  }

  return result;
}

export async function updateCropService(
  cropId: string,
  body: { cropName: string; cropTypeId: string },
): Promise<CropMutationResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crops/${cropId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  const result = await readMutationResponse<CropMutationResponse & ProblemDetail>(res);

  if (!res.ok || result.success === false) {
    throw new Error(
      extractErrorMessage(result, "Failed to update crop. Please try again."),
    );
  }

  return result;
}

export async function deleteCropService(
  cropId: string,
): Promise<CropDeleteResponse> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/crops/${cropId}`, {
    method: "DELETE",
    headers,
  });

  const result = await readMutationResponse<CropDeleteResponse & ProblemDetail>(res);

  if (!res.ok || result.success === false) {
    throw new Error(
      extractErrorMessage(result, "Failed to delete crop. Please try again."),
    );
  }

  return result;
}