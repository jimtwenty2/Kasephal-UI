"use server";

import { otpSchema, type OtpSchema } from "@/schema/otp.schema";
import {
  resendOtpService,
  verifyOtpService,
} from "@/services/auth/otp.service";
import { toAuthActionError } from "@/services/auth/auth-api-error";

export type VerifyOtpActionResult =
  | {
      success: true;
      message: string;
      requiresProfileSetup: boolean;
      profileSetupToken: string;
    }
  | {
      success: false;
      error: string;
    };

export async function verifyOtpAction(
  values: OtpSchema,
  identifier: string,
): Promise<VerifyOtpActionResult> {
  const parsed = otpSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid OTP.",
    };
  }

  if (!identifier) {
    return {
      success: false,
      error: "Identifier is required.",
    };
  }

  try {
    const data = await verifyOtpService({
      identifier,
      code: parsed.data.otp,
    });

    return {
      success: true,
      message: data.message,
      requiresProfileSetup: data.payload.requiresProfileSetup,
      profileSetupToken: data.payload.profileSetupToken,
    };
  } catch (error) {
    return {
      success: false,
      error: toAuthActionError(error),
    };
  }
}

export type ResendOtpActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export async function resendOtpAction(
  identifier: string,
): Promise<ResendOtpActionResult> {
  try {
    const data = await resendOtpService({
      identifier,
    });

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: toAuthActionError(error),
    };
  }
}
