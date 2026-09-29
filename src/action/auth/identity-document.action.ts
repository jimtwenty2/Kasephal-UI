"use server";

import { uploadIdentityDocumentService } from "@/services/auth/identity-document.service";
import { IdentityDocumentRequest } from "@/types/auth/identity.type";
import { skipIdentityVerificationService } from "@/services/auth/identity-document.service";
import { ApiValidationError } from "@/types/auth/api-error";

export type IdentityDocumentActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

export async function uploadIdentityDocumentAction(
  request: IdentityDocumentRequest,
  profileSetupToken?: string,
): Promise<IdentityDocumentActionResult> {
  try {
    const data = await uploadIdentityDocumentService(
      request,
      profileSetupToken,
    );

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Upload Identity Document failed. Please try again.",
    };
  }
}

export type SkipIdentityDocumentActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };
export async function skipIdentityVerificationAction(
  profileSetupToken: string,
): Promise<SkipIdentityDocumentActionResult> {
  try {
    const message =
      await skipIdentityVerificationService(profileSetupToken);

    return {
      success: true,
      message,
    };
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Skip identity verification failed. Please try again.",
    };
  }
}
