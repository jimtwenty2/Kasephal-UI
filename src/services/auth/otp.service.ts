import type {
  ResendOtpRequest,
  ResendOtpResponse,
  VerifyForgotPasswordOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/types/auth/otp.type";
import { apiBaseUrl } from "@/utils/apiBaseUrl";
import { readAuthResponse } from "./auth-api-error";

export async function verifyOtpService(
  body: VerifyOtpRequest,
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readAuthResponse<VerifyOtpResponse>(
    res,
    "Login failed. Please try again.",
  );
}

export async function resendOtpService(
  body: ResendOtpRequest,
): Promise<ResendOtpResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await readAuthResponse<ResendOtpResponse>(
    res,
    "OTP resend failed.",
  );

  if (data.success === false) {
    throw new Error(data.message || "OTP resend failed.");
  }

  return data;
}

export async function verifyOtpForgotPasswordService(
  body: VerifyOtpRequest,
): Promise<VerifyForgotPasswordOtpResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/verify-forgot-password-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readAuthResponse<VerifyForgotPasswordOtpResponse>(
    res,
    "OTP verified failed. Please try again.",
  );
}
