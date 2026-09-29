import type {
  ApiErrorResponse,
  LoginIdentifierOtpPayload,
  UpdateLoginIdentifierRequest,
} from "@/types/profile-identifier";

export function cleanIdentifier(identifier: string) {
  return identifier.trim();
}

export function isEmailIdentifier(identifier: string) {
  return identifier.includes("@");
}

export function buildOtpPayload(identifier: string): LoginIdentifierOtpPayload {
  return {
    identifier: cleanIdentifier(identifier),
  };
}

export function buildLoginIdentifierPayload(
  identifier: string,
  code: string,
): UpdateLoginIdentifierRequest {
  return {
    identifier: cleanIdentifier(identifier),
    code: code.trim(),
  };
}

export function getProfileIdentifierErrorMessage(
  data: ApiErrorResponse,
  fallback: string,
) {
  if (data.errors) {
    const firstError = Object.values(data.errors).flat()[0];

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return data.message || data.detail || data.title || data.error || fallback;
}
