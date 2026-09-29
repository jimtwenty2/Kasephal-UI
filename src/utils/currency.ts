import type { PaymentCurrencyCode } from "@/services/payment.service";

export const KHR_PER_USD = 4000;

export function getPaymentCurrencyCode(value?: string | null): PaymentCurrencyCode {
  return value === "USD" || value === "KHR" ? value : "KHR";
}

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: PaymentCurrencyCode,
  toCurrency: PaymentCurrencyCode,
  khrPerUsd: number = KHR_PER_USD,
) {
  if (fromCurrency === toCurrency) return amount;

  if (fromCurrency === "USD" && toCurrency === "KHR") {
    return amount * khrPerUsd;
  }

  return amount / khrPerUsd;
}

export function roundCurrencyAmount(
  amount: number,
  currencyCode: PaymentCurrencyCode,
) {
  return currencyCode === "KHR" ? Math.round(amount) : Number(amount.toFixed(2));
}

export function formatCurrencyAmount(
  amount: number,
  currencyCode: PaymentCurrencyCode,
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "KHR" ? 0 : 2,
  }).format(amount);
}
