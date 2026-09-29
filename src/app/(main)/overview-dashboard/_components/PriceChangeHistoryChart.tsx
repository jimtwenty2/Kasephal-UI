"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useI18n } from "@/lib/i18n/I18nContext";
import { MarketPrice } from "@/types/market-price";
import type { GovernmentPriceHistory } from "@/types/overview-dashboard";

interface Props {
  marketPrices: MarketPrice[];
  priceHistory?: GovernmentPriceHistory | null;
}

const PRICE_TEXT = {
  priceHistory: { en: "Price History", kh: "ប្រវត្តិតម្លៃ" },
  priceChangeHistory: { en: "Price Change History", kh: "ប្រវត្តិការផ្លាស់ប្តូរតម្លៃ" },
  region: { en: "Region:", kh: "តំបន់:" },
  validUntil: { en: "Valid until", kh: "មានសុពលភាពដល់" },
  current: { en: "Current:", kh: "បច្ចុប្បន្ន:" },
  floor: { en: "Floor:", kh: "តម្លៃអប្បបរមា:" },
  ceiling: { en: "Ceiling:", kh: "តម្លៃអតិបរមា:" },
  chartLabel: { en: "Current Price", kh: "តម្លៃបច្ចុប្បន្ន" },
  tooltipPrice: { en: "Price", kh: "តម្លៃ" },
  minFloor: { en: "Min Floor", kh: "តម្លៃអប្បបរមា" },
  currentLabel: { en: "Current", kh: "បច្ចុប្បន្ន" },
  threshold: { en: "Threshold", kh: "កម្រិត" },
  noData: { en: "No price history found", kh: "រកមិនឃើញប្រវត្តិតម្លៃ" },
} as const;

function formatRegion(region: string) {
  return region.replace(/_/g, " ");
}

export default function PriceChangeHistoryChart({
  marketPrices,
  priceHistory,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof PRICE_TEXT) => PRICE_TEXT[key][lang];

  const cropOptions = priceHistory
    ? [priceHistory.cropName]
    : [...new Set(marketPrices.map((price) => price.crop.cropName))];
  const [selectedCrop, setSelectedCrop] = useState(cropOptions[0] ?? "");
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setOpenDropdown(false), []);

  useDismissibleDropdown({
    open: openDropdown,
    containerRef: dropdownRef,
    onClose: closeDropdown,
  });

  const selectedEntries = priceHistory
    ? []
    : marketPrices.filter((price) => price.crop.cropName === selectedCrop);

  const chartData = priceHistory
    ? priceHistory.points.map((point) => ({
        label: point.label,
        price: point.value,
      }))
    : selectedEntries.length === 1
      ? [
          {
            label: t("minFloor"),
            price: selectedEntries[0].minFloorPrice,
          },
          {
            label: t("currentLabel"),
            price: selectedEntries[0].currentPricePerUnit,
          },
          {
            label: t("threshold"),
            price: selectedEntries[0].priceThresholds,
          },
        ]
      : selectedEntries.map((price) => ({
          label: formatRegion(price.region),
          price: price.currentPricePerUnit,
        }));

  const currentEntry = priceHistory
    ? {
        region: priceHistory.region,
        validityDate: priceHistory.validUntil,
        currentPricePerUnit: priceHistory.currentPrice,
        minFloorPrice: priceHistory.minFloorPrice,
        priceThresholds: priceHistory.thresholdValue,
        currencyCode: priceHistory.currencyCode,
        unitType: priceHistory.unitType,
      }
    : selectedEntries[0]
      ? {
          ...selectedEntries[0],
          currencyCode: selectedEntries[0].currencyCode,
          unitType: selectedEntries[0].unitType,
        }
      : null;

  return (
    <div
      className={`rounded-[16px] border border-light-grey bg-white p-3 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-primary text-[9px] font-bold uppercase">
            {t("priceHistory")}
          </p>
          <h2 className="mt-1 text-[18px] font-bold leading-tight text-primary-heading">
            {t("priceChangeHistory")}
          </h2>
          {currentEntry && (
            <p className="mt-0.5 text-[11px] text-secondary-body">
              {t("region")} <span className="font-semibold">{formatRegion(currentEntry.region)}</span>{" "}
              &middot; {t("validUntil")} {new Date(currentEntry.validityDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex h-[36px] min-w-[150px] items-center justify-between rounded-[12px] border border-light-grey bg-white px-3 text-[12px] font-medium text-primary-heading"
          >
            {selectedCrop || "-"}
            <ChevronDownIcon
              className={`h-4 w-4 transition ${openDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {openDropdown && !priceHistory && (
            <div className="absolute right-0 top-[42px] z-50 max-h-[180px] w-full overflow-y-auto rounded-[12px] border border-light-grey bg-white shadow-lg">
              {cropOptions.map((crop) => (
                <button
                  key={crop}
                  onClick={() => {
                    setSelectedCrop(crop);
                    setOpenDropdown(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-[12px] transition hover:bg-[#F7F9FB] ${
                    selectedCrop === crop
                      ? "bg-[#F3F8F5] font-semibold text-primary"
                      : "text-primary-heading"
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {currentEntry && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#F3F8F5] px-2.5 py-1 text-[10px] font-semibold text-primary">
            {t("current")} {currentEntry.currentPricePerUnit.toLocaleString()} {currentEntry.currencyCode}
          </span>
          <span className="rounded-full bg-[#FFF8F0] px-2.5 py-1 text-[10px] font-semibold text-orange-500">
            {t("floor")} {currentEntry.minFloorPrice.toLocaleString()} {currentEntry.currencyCode}
          </span>
          <span className="rounded-full bg-[#F0F4FF] px-2.5 py-1 text-[10px] font-semibold text-blue-500">
            {t("ceiling")} {currentEntry.priceThresholds.toLocaleString()} {currentEntry.currencyCode}
          </span>
        </div>
      )}

      <h3 className="mt-4 text-[13px] font-bold text-secondary-body">
        {currentEntry
          ? `${t("chartLabel")} (${currentEntry.currencyCode}/${currentEntry.unitType})`
          : t("chartLabel")}
      </h3>

      <div className="mt-2 h-[220px] w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-2xl bg-primary/5 text-[13px] font-semibold text-muted">
            {t("noData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7280" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()} ${currentEntry?.currencyCode ?? "KHR"}`,
                  t("tooltipPrice"),
                ]}
                contentStyle={{
                  borderRadius: 8,
                  fontSize: 11,
                  border: "1px solid #E5E7EB",
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#087A4A"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#087A4A" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
