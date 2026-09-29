import { ApiErrorResponse, ApiValidationError } from "@/types/auth/api-error";

export const AUTH_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
export const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "Service unavailable, please try again later.";

export function isAuthServiceUnavailable(error: unknown) {
  return error instanceof Error && error.message === AUTH_SERVICE_UNAVAILABLE;
}

export function toAuthActionError(error: unknown) {
  if (isAuthServiceUnavailable(error)) {
    return AUTH_SERVICE_UNAVAILABLE_MESSAGE;
  }

  if (error instanceof Error) {
    return isTransientServiceMessage(error.message)
      ? AUTH_SERVICE_UNAVAILABLE_MESSAGE
      : error.message;
  }

  return "Something went wrong. Please try again.";
}

export async function readAuthResponse<T>(
  res: Response,
  fallback: string,
): Promise<T> {
  const data = await readResponseBody(res);
  const errorMessage = extractErrorMessage(data);

  if (res.status >= 500 || (!res.ok && isTransientServiceMessage(errorMessage))) {
    throw new Error(AUTH_SERVICE_UNAVAILABLE);
  }

  if (!res.ok) {
    throw new ApiValidationError(toApiErrorResponse(data, res.status), fallback);
  }

  if (isRecord(data) && data.success === false) {
    if (isTransientServiceMessage(errorMessage)) {
      throw new Error(AUTH_SERVICE_UNAVAILABLE);
    }

    throw new ApiValidationError(toApiErrorResponse(data, res.status), fallback);
  }

  return data as T;
}

function extractErrorMessage(data: unknown) {
  if (isRecord(data)) {
    return [
      getString(data.message),
      getString(data.detail),
      getString(data.error),
      getString(data.title),
    ]
      .filter(Boolean)
      .join(" ");
  }

  return typeof data === "string" ? data : "";
}

function isTransientServiceMessage(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized === AUTH_SERVICE_UNAVAILABLE.toLowerCase() ||
    normalized.includes("service unavailable") ||
    normalized.includes("external service") ||
    normalized.includes("sms service") ||
    normalized.includes("email service") ||
    normalized.includes("otp service") ||
    normalized.includes("fetch failed") ||
    normalized.includes("network")
  );
}

function toApiErrorResponse(data: unknown, status: number): ApiErrorResponse {
  if (isRecord(data)) {
    return {
      detail: getString(data.detail) || getString(data.message) || getString(data.error),
      instance: getString(data.instance),
      status: getNumber(data.status) || status,
      title: getString(data.title) || getString(data.error),
      timestamp: getString(data.timestamp),
      errors: isStringRecord(data.errors) ? data.errors : undefined,
      payload: data.payload,
    };
  }

  const message = typeof data === "string" && data.trim() ? data.trim() : "";

  return {
    detail: message,
    instance: "",
    status,
    title: "",
    timestamp: "",
  };
}

async function readResponseBody(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isRecord(value)) return false;

  return Object.values(value).every((item) => typeof item === "string");
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : 0;
}
