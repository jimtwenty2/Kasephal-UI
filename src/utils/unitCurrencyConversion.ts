export type MarketUnit = "KG" | "TON";
export type MarketCurrency = "KHR" | "USD";

const KG_PER_TON = 1000;

export function toMarketUnit(unit?: string): MarketUnit {
  return unit === "TON" || unit === "TONS" ? "TON" : "KG";
}

export function roundMarketQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return 0;

  return Number(quantity.toFixed(3));
}

export function roundMarketCurrency(
  amount: number,
  currencyCode: MarketCurrency,
) {
  if (!Number.isFinite(amount)) return 0;

  return currencyCode === "KHR"
    ? Math.round(amount / 100) * 100
    : Number(amount.toFixed(2));
}

export function convertMarketQuantity(
  quantity: number,
  fromUnit: MarketUnit,
  toUnit: MarketUnit,
) {
  if (fromUnit === toUnit) return quantity;

  return fromUnit === "KG" && toUnit === "TON"
    ? quantity / KG_PER_TON
    : quantity * KG_PER_TON;
}

export function convertMarketPricePerUnit(
  pricePerUnit: number,
  fromUnit: MarketUnit,
  toUnit: MarketUnit,
) {
  if (fromUnit === toUnit) return pricePerUnit;

  return fromUnit === "KG" && toUnit === "TON"
    ? pricePerUnit * KG_PER_TON
    : pricePerUnit / KG_PER_TON;
}

export function convertMarketCurrencyAmount(
  amount: number,
  fromCurrency: MarketCurrency,
  toCurrency: MarketCurrency,
  khrPerUsd: number,
) {
  if (fromCurrency === toCurrency) return amount;

  return fromCurrency === "USD" && toCurrency === "KHR"
    ? amount * khrPerUsd
    : amount / khrPerUsd;
}
