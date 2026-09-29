"use server";

import { checkMarketPrice } from "@/services/market-price.service";
import type {
  MarketPriceCheckRequest,
  MarketPriceCheckResponse,
} from "@/types/market-price";

export type CheckMarketPriceActionResult =
  | {
      success: true;
      data: MarketPriceCheckResponse;
    }
  | {
      success: false;
      error: string;
    };

export async function checkMarketPriceAction(
  input: MarketPriceCheckRequest,
): Promise<CheckMarketPriceActionResult> {
  if (!input.postId) {
    return { success: false, error: "Missing post reference." };
  }

  if (!input.pricePerUnit || input.pricePerUnit <= 0) {
    return { success: false, error: "Price per unit must be greater than 0." };
  }

  try {
    const data = await checkMarketPrice(input);
    return { success: true, data };
  } catch (error) {
    console.error("Market price check failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to check market price.",
    };
  }
}
