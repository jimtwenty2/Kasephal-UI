"use server";

import {
  FarmerProfileSetupRequest,
} from "@/types/auth/register.type";
import { setupFarmerProfileService } from "@/services/auth/set-up-profile.service";
import { ApiValidationError } from "@/types/auth/api-error";

export type FarmerProfileSetupActionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

export async function setupFarmerProfileAction(
  payload: FarmerProfileSetupRequest,
  token: string
): Promise<FarmerProfileSetupActionResult> {
  try {
    const data = await setupFarmerProfileService(payload,token);

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