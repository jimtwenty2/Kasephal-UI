"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  createFarmerOffer,
  deleteFarmerOffer,
  updateFarmerOffer,
} from "@/services/farmerOffer.service";
import type { FarmerOfferMutationResult } from "@/types/farmer-offer";
import {
  IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
  isIdentityVerified,
} from "@/lib/identityVerification";

function revalidateOfferPaths(id?: string) {
  revalidateTag("crop-demands", "max");
  revalidatePath("/listing-crop-demands", "page");

  if (id) {
    revalidatePath(`/listing-crop-demands/${id}`, "page");
  }
}

export async function createFarmerOfferAction(
  demandId: string,
  body: object,
): Promise<FarmerOfferMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await createFarmerOffer(demandId, body);

  if (result.success) revalidateOfferPaths(demandId);

  return result;
}

export async function updateFarmerOfferAction(
  offerId: string,
  body: object,
  demandId?: string,
): Promise<FarmerOfferMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await updateFarmerOffer(offerId, body);

  if (result.success) revalidateOfferPaths(demandId);

  return result;
}

export async function deleteFarmerOfferAction(
  offerId: string,
  demandId?: string,
): Promise<FarmerOfferMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await deleteFarmerOffer(offerId);

  if (result.success) revalidateOfferPaths(demandId);

  return result;
}
