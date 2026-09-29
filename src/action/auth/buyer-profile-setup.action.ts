"use server";

import { BuyerProfileSetupRequest } from "@/types/auth/register.type";
import { setupBuyerProfileService } from "@/services/auth/set-up-profile.service";
import { ApiValidationError } from "@/types/auth/api-error";
export type BuyerProfileSetupActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function setupBuyerProfileAction(
  payload: BuyerProfileSetupRequest,
  token: string,
): Promise<BuyerProfileSetupActionResult> {
  try {
    const data = await setupBuyerProfileService(payload, token);

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
      error: "Something went wrong",
    };
  }
}
