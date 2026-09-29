"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { revalidatePath } from "next/cache";

import { createMarketPrice } from "@/services/market-price.service";
import { CreateMarketPriceRequest } from "@/types/market-price";

export async function createMarketPriceAction(
  prevState: {
    success: boolean;
    error: string;
  },
  formData: FormData,
) {
  try {
    await requireGovernmentContentManager();

    const cropType = formData.get("cropType") as string;
    const cropName = formData.get("cropName") as string;
    const region = formData.get("region") as string;
    const unitType = formData.get("unitType") as "KG" | "TON";

    const currentPricePerUnit = Number(formData.get("currentPricePerUnit"));

    const minFloorPrice = Number(formData.get("minFloorPrice"));

    const priceThresholds = Number(formData.get("priceThresholds"));

    const validityDate = new Date(
      formData.get("validityDate") as string,
    ).toISOString();

    const payload: CreateMarketPriceRequest = {
      cropType,
      cropName,
      region,
      unitType,
      currencyCode: "KHR",
      currentPricePerUnit,
      minFloorPrice,
      validityDate,
      priceThresholds,
      scheduledAt: new Date().toISOString(),
    };
    await createMarketPrice(payload);

    revalidatePath("/market-price");

    return {
      success: true,
      error: "",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create market price",
    };
  }
}
