import { ApiErrorResponse,ApiValidationError } from "@/types/auth/api-error";
import {
  BuyerProfileSetupRequest,
  FarmerProfileSetupRequest,
  ProfileSetupResponse,
} from "@/types/auth/register.type";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

export async function setupFarmerProfileService(
  payload: FarmerProfileSetupRequest,
  token: string,
): Promise<ProfileSetupResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/setup/farmer-profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ProfileSetupResponse | ApiErrorResponse = await res.json();

    if (!res.ok) {
    throw new ApiValidationError(
      data as ApiErrorResponse,
      "Setup Farmer Profile failed. Please try again.",
    );
  }

  return data as ProfileSetupResponse;
}

export async function setupBuyerProfileService(
  payload: BuyerProfileSetupRequest,
  token: string,
): Promise<ProfileSetupResponse> {
  const res = await fetch(`${apiBaseUrl}/auth/setup/buyer-profile`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: ProfileSetupResponse | ApiErrorResponse = await res.json();

  if (!res.ok) {
    throw new ApiValidationError(
      data as ApiErrorResponse,
      "Setup Buyer Profile failed. Please try again.",
    );
  }

  return data as ProfileSetupResponse;
}