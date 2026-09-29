"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  createCropService,
  createCropTypeService,
  deleteCropService,
  deleteCropTypeService,
  getCropsService,
  getCropTypesService,
  updateCropService,
  updateCropTypeService,
} from "@/services/crop.service";

function revalidateCropCatalog() {
  revalidateTag("crop-types", "max");
  revalidateTag("crops", "max");
  revalidatePath("/overview-dashboard", "page");
  revalidatePath("/overview-dashboard/crop-management", "page");
  revalidatePath("/crop-management", "page");
}

export async function getCropTypesAction() {
  try {
    const cropTypes = await getCropTypesService();

    return {
      data: cropTypes.payload,
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Get crop types failed. Please try again.",
    };
  }
}

export async function getCropsAction() {
  try {
    const crops = await getCropsService();

    return {
      data: crops.payload,
      error: null,
    };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Get crops failed. Please try again.",
    };
  }
}

export async function createCropTypeAction(body: { typeName: string }) {
  const typeName = body.typeName.trim();

  if (!typeName) {
    return { success: false, error: "Crop type name is required." };
  }

  try {
    await requireGovernmentContentManager();

    const result = await createCropTypeService({ typeName });

    revalidateCropCatalog();

    return {
      success: true,
      data: result.payload ?? null,
      message: result.message ?? "Crop type created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Create crop type failed. Please try again.",
    };
  }
}

export async function updateCropTypeAction(body: {
  cropTypeId: string;
  typeName: string;
}) {
  const cropTypeId = body.cropTypeId.trim();
  const typeName = body.typeName.trim();

  if (!cropTypeId) {
    return { success: false, error: "Crop type ID is required." };
  }

  if (!typeName) {
    return { success: false, error: "Crop type name is required." };
  }

  try {
    await requireGovernmentContentManager();

    const result = await updateCropTypeService(cropTypeId, { typeName });

    revalidateCropCatalog();

    return {
      success: true,
      data: result.payload ?? null,
      message: result.message ?? "Crop type updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Update crop type failed. Please try again.",
    };
  }
}

export async function deleteCropTypeAction(cropTypeId: string) {
  const trimmedCropTypeId = cropTypeId.trim();

  if (!trimmedCropTypeId) {
    return { success: false, error: "Crop type ID is required." };
  }

  try {
    await requireGovernmentContentManager();

    const result = await deleteCropTypeService(trimmedCropTypeId);

    revalidateCropCatalog();

    return {
      success: true,
      data: result.payload ?? null,
      message: result.message ?? "Crop type deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Delete crop type failed. Please try again.",
    };
  }
}

export async function createCropAction(body: {
  cropName: string;
  cropTypeId: string;
}) {
  const cropName = body.cropName.trim();
  const cropTypeId = body.cropTypeId.trim();

  if (!cropName) {
    return { success: false, error: "Crop name is required." };
  }

  if (!cropTypeId) {
    return { success: false, error: "Crop type is required." };
  }

  try {
    await requireGovernmentContentManager();

    const result = await createCropService({ cropName, cropTypeId });

    revalidateCropCatalog();

    return {
      success: true,
      data: result.payload ?? null,
      message: result.message ?? "Crop created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Create crop failed. Please try again.",
    };
  }
}

export async function updateCropAction(body: {
  cropId: string;
  cropName: string;
  cropTypeId: string;
}) {
  const cropId = body.cropId.trim();
  const cropName = body.cropName.trim();
  const cropTypeId = body.cropTypeId.trim();

  if (!cropId) {
    return { success: false, error: "Crop ID is required." };
  }

  if (!cropName) {
    return { success: false, error: "Crop name is required." };
  }

  if (!cropTypeId) {
    return { success: false, error: "Crop type is required." };
  }

  try {
    await requireGovernmentContentManager();

    const result = await updateCropService(cropId, { cropName, cropTypeId });

    revalidateCropCatalog();

    return {
      success: true,
      data: result.payload ?? null,
      message: result.message ?? "Crop updated successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Update crop failed. Please try again.",
    };
  }
}

export async function deleteCropAction(cropId: string) {
  const trimmedCropId = cropId.trim();

  if (!trimmedCropId) {
    return { success: false, error: "Crop ID is required." };
  }

  try {
    await requireGovernmentContentManager();

    const result = await deleteCropService(trimmedCropId);

    revalidateCropCatalog();

    return {
      success: true,
      data: result.payload ?? null,
      message: result.message ?? "Crop deleted successfully.",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Delete crop failed. Please try again.",
    };
  }
}
