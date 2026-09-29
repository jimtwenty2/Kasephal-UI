"use server";

import { requireGovernmentContentManager } from "@/lib/roleGuards";
import { deleteMarketPrice } from "@/services/market-price.service";

export async function deleteMarketPriceAction(marketPriceId: string) {
  try {
    await requireGovernmentContentManager();

    await deleteMarketPrice(marketPriceId);

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
          : "Failed to delete market price.",
    };
  }
}