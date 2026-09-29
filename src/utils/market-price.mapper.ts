import { MarketPrice } from "@/types/market-price";
import { MarketPriceRow } from "@/types/market-price-row";
import { formatRegion } from "./location.mapper";

function toKHR(value: number, currencyCode: string, usdKhrRate: number) {
  return currencyCode === "USD" ? value * usdKhrRate : value;
}

function normalizeUnitType(unitType?: string): "KG" | "TON" {
  return unitType === "TON" ? "TON" : "KG";
}

export function mapMarketPricesToRows(
  marketPrices: MarketPrice[] = [],
  usdKhrRate = 4100,
): MarketPriceRow[] {
  return marketPrices.map((item, index) => ({
    marketPriceId: item.marketPriceId,

    no: index + 1,

    cropName: item.crop?.cropName ?? "-",

    cropType: item.crop?.cropTypeName ?? "-",

    region: formatRegion(item.region ?? ""),

    unit: normalizeUnitType(item.unitType),

    currentPrice: toKHR(
      item.currentPricePerUnit ?? 0,
      item.currencyCode,
      usdKhrRate,
    ),

    minPrice: toKHR(item.minFloorPrice ?? 0, item.currencyCode, usdKhrRate),

    currencyCode: "KHR",

    validityDate: item.validityDate ?? "",

    priceThresholds: toKHR(
      item.priceThresholds ?? 0,
      item.currencyCode,
      usdKhrRate,
    ),

    scheduledAt: item.scheduledAt ?? "",
  }));
}