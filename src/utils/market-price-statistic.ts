import { MarketPrice } from "@/types/market-price";

function toKHRPerKg(price: MarketPrice, usdKhrRate: number) {
  const priceInKHR =
    price.currencyCode === "USD"
      ? price.currentPricePerUnit * usdKhrRate
      : price.currentPricePerUnit;

  return price.unitType === "TON" ? priceInKHR / 1000 : priceInKHR;
}

export function calculateMarketStatistic(
  marketPrices: MarketPrice[],
  usdKhrRate: number,
) {
  if (marketPrices.length === 0) {
    return {
      highestPriceCrop: null,
      lowestPriceCrop: null,
      highestPriceInKHR: 0,
      lowestPriceInKHR: 0,
    };
  }

  const highestPriceCrop = marketPrices.reduce((max, current) =>
    toKHRPerKg(current, usdKhrRate) > toKHRPerKg(max, usdKhrRate)
      ? current
      : max,
  );

  const lowestPriceCrop = marketPrices.reduce((min, current) =>
    toKHRPerKg(current, usdKhrRate) < toKHRPerKg(min, usdKhrRate)
      ? current
      : min,
  );

  return {
    highestPriceCrop,
    lowestPriceCrop,
    highestPriceInKHR: toKHRPerKg(highestPriceCrop, usdKhrRate),
    lowestPriceInKHR: toKHRPerKg(lowestPriceCrop, usdKhrRate),
  };
}
