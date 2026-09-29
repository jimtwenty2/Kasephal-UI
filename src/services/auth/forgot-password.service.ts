import {
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "@/types/auth/forgot-password";
import { apiBaseUrl } from "@/utils/apiBaseUrl";
import { readAuthResponse } from "./auth-api-error";

export async function initiateForgotPasswordService(
  identifier: string,
): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({identifier}),
  });

  return readAuthResponse<ForgotPasswordResponse>(
    res,
    "Forgot password initiate failed. Please try again.",
  );
}

export async function resetPasswordService(
  body: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readAuthResponse<ResetPasswordResponse>(
    res,
    "Reset password failed. Please try again.",
  );
}
