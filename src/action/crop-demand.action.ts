"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  createCropDemand,
  deleteCropDemand,
  getCropDemandByPostId,
  getCropDemands,
  getCropDemandsOwn,
  updateCropDemand,
  updateCropDemandStatus,
} from "@/services/cropDemand.service";
import type {
  CropDemandListParams,
  CropDemandMutationResult,
  CropDemandRequestBody,
  GetCropDemandResult,
  GetCropDemandsResult,
  UpdateCropDemandStatusBody,
} from "@/types/crop-demand";
import {
  IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
  isIdentityVerified,
} from "@/lib/identityVerification";

const DEMAND_PATHS = [
  "/listing-crop-demands",
  "/crop-demands-management",
  "/own-profile",
];

function revalidateCropDemands(cropDemandId?: string) {
  revalidateTag("crop-demands", "max");

  if (cropDemandId) {
    revalidateTag(`crop-demand-${cropDemandId}`, "max");
    revalidatePath(`/listing-crop-demands/${cropDemandId}`, "page");
    revalidatePath(`/crop-demands-edit/${cropDemandId}`, "page");
  }

  DEMAND_PATHS.forEach((path) => revalidatePath(path, "page"));
}

export async function getCropDemandsAction(
  params: CropDemandListParams = {},
): Promise<GetCropDemandsResult> {
  return getCropDemands(params);
}

export async function getOwnCropDemandsAction(
  params: CropDemandListParams = {},
): Promise<GetCropDemandsResult> {
  return getCropDemandsOwn(params);
}

export async function getCropDemandByPostIdAction(
  postId: string,
): Promise<GetCropDemandResult> {
  return getCropDemandByPostId(postId);
}

export async function createCropDemandAction(
  body: CropDemandRequestBody,
): Promise<CropDemandMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await createCropDemand(body);

  if (result.success) {
    revalidateCropDemands(result.data?.cropDemandPostId ?? result.data?.postId);
  }

  return result;
}

export async function updateCropDemandAction(
  postId: string,
  body: CropDemandRequestBody,
): Promise<CropDemandMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await updateCropDemand(postId, body);

  if (result.success) {
    revalidateCropDemands(postId);
  }

  return result;
}

export async function updateCropDemandStatusAction(
  postId: string,
  body: UpdateCropDemandStatusBody,
): Promise<CropDemandMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await updateCropDemandStatus(postId, body);

  if (result.success) {
    revalidateCropDemands(postId);
  }

  return result;
}

export async function deleteCropDemandAction(
  postId: string,
): Promise<CropDemandMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await deleteCropDemand(postId);

  if (result.success) {
    revalidateCropDemands(postId);
  }

  return result;
}
