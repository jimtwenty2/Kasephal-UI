"use server";

import {
  accountSchema,
  type AccountSchema,
} from "@/schema/account-creation.schema";
import { accountCreationService } from "@/services/auth/auth.service";
import {
  AccountCreationPayload,
  AccountCreationRequest,
} from "@/types/auth/register.type";
import { ApiValidationError } from "@/types/auth/api-error";
import { toAuthActionError } from "@/services/auth/auth-api-error";

type ResumeStep = 2 | 3 | 4 | 5;

export type AccountCreationActionResult =
  | {
      success: true;
      message: string;
      resume?: false;
    }
  | {
      success: true;
      message: string;
      resume: true;
      profileSetupToken: string;
      resumeStep: ResumeStep;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown) {
  return typeof value === "number" ? value : Number.NaN;
}

function toAccountCreationPayload(value: unknown): AccountCreationPayload {
  if (!isRecord(value)) return {};

  return {
    profileSetupToken: getString(value.profileSetupToken),
    requiresProfileSetup: value.requiresProfileSetup === true,
    nextStep: getNumber(value.nextStep),
    registrationStep: getString(value.registrationStep),
    setupStage: getString(value.setupStage),
    status: getString(value.status),
    profileSetupCompleted: value.profileSetupCompleted === true,
    identityVerificationRequired: value.identityVerificationRequired === true,
  };
}

function resolveResumeStep(payload: AccountCreationPayload): ResumeStep {
  if (
    payload.nextStep === 2 ||
    payload.nextStep === 3 ||
    payload.nextStep === 4 ||
    payload.nextStep === 5
  ) {
    return payload.nextStep;
  }

  const stage = [
    payload.registrationStep,
    payload.setupStage,
    payload.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toUpperCase();

  if (
    payload.profileSetupCompleted ||
    payload.identityVerificationRequired ||
    stage.includes("IDENTITY") ||
    stage.includes("DOCUMENT")
  ) {
    return 5;
  }

  if (stage.includes("OTP")) return 2;

  return 3;
}

function buildResumeResult(
  message: string,
  payloadValue: unknown,
): AccountCreationActionResult | null {
  const payload = toAccountCreationPayload(payloadValue);

  if (!payload.profileSetupToken) return null;

  return {
    success: true,
    message,
    resume: true,
    profileSetupToken: payload.profileSetupToken,
    resumeStep: resolveResumeStep(payload),
  };
}

export async function accountCreationAction(
  values: AccountSchema,
  role: "FARMER" | "BUYER",
): Promise<AccountCreationActionResult> {
  const parsed = accountSchema.safeParse(values);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const identifier = parsed.data.email || parsed.data.phoneNumber;

  if (!identifier) {
    return {
      success: false,
      error: "Phone number or email is required",
    };
  }

  const accountInfo: AccountCreationRequest = {
    identifier,
    password: parsed.data.password,
    confirmPassword: parsed.data.confirmPassword,
    role,
  };

  try {
    const data = await accountCreationService(accountInfo);
    const resumeResult = buildResumeResult(
      data.message,
      data.payload ?? data,
    );

    if (resumeResult) return resumeResult;

    return {
      success: true,
      message: data.message,
      resume: false,
    };
  } catch (err) {
    if (err instanceof ApiValidationError) {
      const resumeResult = buildResumeResult(
        err.message,
        err.payload ?? err.data,
      );

      if (resumeResult) return resumeResult;

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
