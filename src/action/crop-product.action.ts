"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  createCropProduct,
  deleteCropProduct,
  getCropProductById,
  getCropProductByPostId,
  getCropProducts,
  getCropProductsByUserId,
  getOwnCropProducts,
  updateCropProduct,
  updateCropProductQuantity,
} from "@/services/cropProduct.service";
import type {
  CropProductListParams,
  CropProductMutationResult,
  GetCropProductResult,
  GetCropProductsResult,
} from "@/types/crop-product";
import {
  IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
  isIdentityVerified,
} from "@/lib/identityVerification";

const PRODUCT_PATHS = [
  "/listing-product",
  "/crop-product-management",
  "/own-profile",
];

function revalidateCropProducts(cropProductId?: string) {
  revalidateTag("crop-products", "max");

  if (cropProductId) {
    revalidateTag(`crop-product-${cropProductId}`, "max");
    revalidatePath(`/listing-product/${cropProductId}`, "page");
    revalidatePath(`/crop-product-edit/${cropProductId}`, "page");
  }

  PRODUCT_PATHS.forEach((path) => revalidatePath(path, "page"));
}

export async function getCropProductsAction(
  page = 1,
  size = 10,
  filters: Omit<CropProductListParams, "page" | "size"> = {},
): Promise<GetCropProductsResult> {
  return getCropProducts(page, size, filters);
}

export async function getOwnCropProductsAction(
  page = 1,
  size = 10,
  filters: Omit<CropProductListParams, "page" | "size"> = {},
): Promise<GetCropProductsResult> {
  return getOwnCropProducts(page, size, filters);
}

export async function getCropProductsByUserIdAction(
  userId: string,
  page = 1,
  size = 100,
): Promise<GetCropProductsResult> {
  if (!userId) {
    return { data: [], error: "Missing farmer reference." };
  }

  return getCropProductsByUserId(userId, page, size);
}

export async function getCropProductByIdAction(
  cropProductId: string,
): Promise<GetCropProductResult> {
  return getCropProductById(cropProductId);
}

export async function getCropProductByPostIdAction(
  postId: string,
): Promise<GetCropProductResult> {
  return getCropProductByPostId(postId);
}

export async function createCropProductAction(
  body: FormData | object,
): Promise<CropProductMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await createCropProduct(body);

  if (result.success) {
    revalidateCropProducts(result.data?.cropProductPostId ?? result.data?.postId);
  }

  return result;
}

export async function updateCropProductAction(
  cropProductId: string,
  body: FormData | object,
): Promise<CropProductMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await updateCropProduct(cropProductId, body);

  if (result.success) {
    revalidateCropProducts(cropProductId);
  }

  return result;
}

export async function updateCropProductQuantityAction(
  cropProductId: string,
  quantity: number,
): Promise<CropProductMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await updateCropProductQuantity(cropProductId, quantity);

  if (result.success) {
    revalidateCropProducts(cropProductId);
  }

  return result;
}

export async function deleteCropProductAction(
  cropProductId: string,
): Promise<CropProductMutationResult> {
  if (!(await isIdentityVerified())) {
    return {
      success: false,
      error: IDENTITY_VERIFICATION_REQUIRED_MESSAGE,
    };
  }

  const result = await deleteCropProduct(cropProductId);

  if (result.success) {
    revalidateCropProducts(cropProductId);
  }

  return result;
}
