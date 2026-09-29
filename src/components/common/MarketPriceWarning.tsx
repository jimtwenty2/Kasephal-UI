"use client";

import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import type { MarketPriceCheckResponse } from "@/types/market-price";
import { formatCurrencyAmount } from "@/utils/currency";

type Props = {
  check: MarketPriceCheckResponse | null;
  error?: string | null;
  isChecking?: boolean;
  unitType?: string;
};

const WARNING_COPY: Record<string, string> = {
  BELOW_FLOOR_PRICE: "Price is below the market floor.",
  HIGHER_THAN_MARKET: "Price is higher than current market range.",
  LOWER_THAN_MARKET: "Price is lower than current market range.",
  NORMAL: "Price is within current market range.",
};

export function MarketPriceWarning({
  check,
  error,
  isChecking,
  unitType,
}: Props) {
  if (isChecking) {
    return (
      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Checking market price...
      </p>
    );
  }

  if (error) {
    return (
      <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
        <Info className="h-5 w-5" />
        No current market price is available for the selected crop and region. You can still continue, but the system cannot compare your price with the market price.
      </p>
    );
  }

  if (!check) return null;

  const isNormal = check.warningType === "NORMAL";
  const deviationPercent = Number(check.deviationPercent);
  const isHighDeviation = Math.abs(deviationPercent) >= 50;

  const Icon = isNormal ? CheckCircle2 : AlertTriangle;
  let toneClass = isNormal
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-800";

  if (!isNormal && isHighDeviation) {
    toneClass = "border-red-200 bg-red-50 text-red-700";
  }

  const displayUnit = unitType || check.unitType;

  return (
    <div
      className={`mt-2 rounded-lg border px-3 py-2 text-[12px] font-semibold ${toneClass}`}
    >
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p>{WARNING_COPY[check.warningType] ?? "Market price checked."}</p>
          <p className="mt-0.5 font-medium opacity-90">
            Market:{" "}
            {formatCurrencyAmount(
              Number(check.currentMarketPrice),
              check.currencyCode === "USD" ? "USD" : "KHR",
            )}{" "}
            / {displayUnit}
            {Number.isFinite(Number(check.deviationPercent)) &&
              `, deviation ${Number(check.deviationPercent).toFixed(2)}%`}
          </p>
        </div>
      </div>
    </div>
  );
}
