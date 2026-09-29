"use server";

import {
  initiateForgotPasswordService,
  resetPasswordService,
} from "@/services/auth/forgot-password.service";
import { OtpSchema, otpSchema } from "@/schema/otp.schema";
import { verifyOtpForgotPasswordService } from "@/services/auth/otp.service";
import { ResetPasswordRequest } from "@/types/auth/forgot-password";
import { ResetPasswordFormData } from "@/schema/reset-password.schema";
import { ApiValidationError } from "@/types/auth/api-error";
import { toAuthActionError } from "@/services/auth/auth-api-error";

export type ForgotPasswordActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function forgotPasswordInitiateAction(
  identifier: string,
): Promise<ForgotPasswordActionResult> {
  try {
    const data = await initiateForgotPasswordService(identifier);
    return {
      success: true,
      message: data.message,
    };
  } catch (err) {
    if (err instanceof ApiValidationError) {
      return {
        success: false,
        error: err.message,
        fieldErrors: err.errors,
      };
    }

    return {
      success: false,
      error: toAuthActionError(err),
    };
  }
}
export type VerifyForgotPasswordOtpActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function verifyForgotPasswordOtpAction(
  values: OtpSchema,
  identifier: string,
): Promise<VerifyForgotPasswordOtpActionResult> {
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
    const data = await verifyOtpForgotPasswordService({
      identifier,
      code: parsed.data.otp,
    });

    return {
      success: true,
      message: data.message,
    };
  } catch (err) {
    if (err instanceof ApiValidationError) {
      return {
        success: false,
        error: err.message,
        fieldErrors: err.errors,
      };
    }

    return {
      success: false,
      error: toAuthActionError(err),
    };
  }
}

export type ResetPasswordActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function resetPasswordInitiateAction(
  values: ResetPasswordFormData,
  identifier: string,
): Promise<ResetPasswordActionResult> {
  try {
    const body: ResetPasswordRequest = {
      identifier: identifier,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
    };
    const data = await resetPasswordService(body);

    return {
      success: true,
      message: data.message,
    };
  } catch (err) {
    if (err instanceof ApiValidationError) {
      return {
        success: false,
        error: err.message,
        fieldErrors: err.errors,
      };
    }

    return {
      success: false,
      error: toAuthActionError(err),
    };
  }
}
