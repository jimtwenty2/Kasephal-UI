"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { updateMarketPricesBulk } from "@/services/market-price.service";
import { UpdateMarketPriceBulkRequest } from "@/types/market-price";

export async function updateMarketPriceAction(
  payload: UpdateMarketPriceBulkRequest[],
) {
  try {
    await requireGovernmentContentManager();

    const updatedMarketPrices = await updateMarketPricesBulk(payload);

    return {
      success: true,
      payload: updatedMarketPrices,
      error: "",
    };
  } catch (error) {
    return {
      success: false,
      payload: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to update market price.",
    };
  }
}