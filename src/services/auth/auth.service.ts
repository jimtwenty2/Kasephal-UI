import { ApiErrorResponse, ApiValidationError } from "@/types/auth/api-error";
import { LoginRequest, LoginResponse } from "@/types/auth/login.type";
import { apiBaseUrl } from "@/utils/apiBaseUrl";
import {
  AccountCreationRequest,
  AccountCreationResponse,
} from "@/types/auth/register.type";
import { readAuthResponse } from "./auth-api-error";

export async function loginService(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data: LoginResponse | ApiErrorResponse = await res.json();

  if (!res.ok) {
    throw new ApiValidationError(
      data as ApiErrorResponse,
      "Login failed. Please try again.",
    );
  }

  return data as LoginResponse;
}

type LogoutServiceResult =
  | { success: true }
  | { success: false; status?: number; message: string };

export async function logoutService(
  accessToken: string,
): Promise<LogoutServiceResult> {
  try {
    const res = await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok) {
      return { success: true };
    }

    const data = (await res.json().catch(() => null)) as {
      message?: string;
      error?: string;
    } | null;

    return {
      success: false,
      status: res.status,
      message: data?.message ?? data?.error ?? "Backend logout failed.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Backend logout failed.",
    };
  }
}

export async function accountCreationService(
  body: AccountCreationRequest,
): Promise<AccountCreationResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return readAuthResponse<AccountCreationResponse>(
    res,
    "Account creation failed. Please try again.",
  );
}
