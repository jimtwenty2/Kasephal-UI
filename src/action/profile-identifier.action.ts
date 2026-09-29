"use server";

import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type {
  ApiErrorResponse,
  ApiResponse,
  LoginIdentifierPayload,
} from "@/types/profile-identifier";
import {
  buildLoginIdentifierPayload,
  buildOtpPayload,
  getProfileIdentifierErrorMessage,
} from "@/utils/profile-identifier";

// ─── Error Handler ────────────────────────────────────────────────────────────

async function readErrorMessage(res: Response, fallback: string) {
  if (res.status >= 500) {
    return "SERVICE_UNAVAILABLE";
  }

  try {
    const data = (await res.json()) as ApiErrorResponse;
    return getProfileIdentifierErrorMessage(data, fallback);
  } catch {
    return fallback;
  }
}

async function readError(res: Response, fallback: string): Promise<never> {
  throw new Error(await readErrorMessage(res, fallback));
}

type OtpActionResult =
  | { success: true; payload: string }
  | { success: false; error: string };

// ─── Send Login Identifier OTP ────────────────────────────────────────────────

export async function addLoginIdentifierOtpAction(
  identifier: string,
): Promise<OtpActionResult> {
  const headers = await headerToken();

  try {
    const res = await fetch(
      `${env.NEXT_BASE_API_URL}/profile/login-identifiers/otp`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildOtpPayload(identifier)),
      },
    );

    if (!res.ok) {
      return {
        success: false,
        error: await readErrorMessage(res, "Failed to send OTP."),
      };
    }

    const data = (await res.json()) as ApiResponse<string>;
    return { success: true, payload: data.payload };
  } catch {
    return {
      success: false,
      error: "SERVICE_UNAVAILABLE",
    };
  }
}

// ─── Update Login Identifier ──────────────────────────────────────────────────

export async function updateLoginIdentifierAction(
  identifier: string,
  code: string,
): Promise<LoginIdentifierPayload> {
  const headers = await headerToken();

  const res = await fetch(
    `${env.NEXT_BASE_API_URL}/profile/login-identifiers`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildLoginIdentifierPayload(identifier, code)),
    },
  );

  if (!res.ok) {
    await readError(res, "Failed to update login identifier.");
  }

  const data = (await res.json()) as ApiResponse<LoginIdentifierPayload>;
  return data.payload;
}
