"use client";

import { useState } from "react";
import Link from "next/link";
import PaginationComponent from "@/components/action-components/PaginationComponent";
import { MarketPrice } from "@/types/market-price";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { GovernmentPriceChange } from "@/types/overview-dashboard";

type Props = {
  marketPrices: MarketPrice[];
  priceChanges?: GovernmentPriceChange[];
};

const PAGE_SIZE = 5;

function formatRegion(region: string) {
  return region.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function calcChange(current: number, min: number) {
  if (min === 0) return { label: "+0 (0%)", isPositive: true };
  const diff = current - min;
  const pct = ((diff / min) * 100).toFixed(1);
  const isPositive = diff >= 0;
  return {
    label: isPositive
      ? `+${diff.toLocaleString()} (+${pct}%)`
      : `${diff.toLocaleString()} (${pct}%)`,
    isPositive,
  };
}

const PRICE_LIST_TEXT = {
  label: { en: "Price History List", kh: "បញ្ជីប្រវត្តិតម្លៃ" },
  title: {
    en: "List of Current Price Changes (vs Last Month)",
    kh: "បញ្ជីការផ្លាស់ប្តូរតម្លៃបច្ចុប្បន្ន (បៀបធៀបខែមុន)",
  },
  seeAll: { en: "See All", kh: "មើលទាំងអស់" },
  colNo: { en: "No", kh: "លរ" },
  colCropName: { en: "Crop Name", kh: "ឈ្មោះដំណាំ" },
  colCropType: { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  colRegion: { en: "Region", kh: "តំបន់" },
  colPrice: { en: "Current Price", kh: "តម្លៃបច្ចុប្បន្ន" },
  colChange: { en: "Change", kh: "ការប្រែប្រួល" },
  colDate: { en: "Effective Date", kh: "កាលបរិច្ឆេទមានប្រសិទ្ធភាព" },
  noData: { en: "No price history found.", kh: "រកមិនឃើញប្រវត្តិតម្លៃ។" },
} as const;

export default function PriceHistoryList({
  marketPrices,
  priceChanges = [],
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof PRICE_LIST_TEXT) => PRICE_LIST_TEXT[key][lang];

  const [page, setPage] = useState(1);

  const rows =
    priceChanges.length > 0
      ? priceChanges
      : marketPrices.map((item) => {
          const change = calcChange(
            item.currentPricePerUnit,
            item.minFloorPrice,
          );

          return {
            marketPriceId: item.marketPriceId,
            cropName: item.crop?.cropName ?? "N/A",
            cropTypeName: item.crop?.cropTypeName ?? "N/A",
            region: item.region,
            currentPrice: item.currentPricePerUnit,
            changeLabel: change.label,
            isPositive: change.isPositive,
            effectiveDate: item.validityDate,
          };
        });

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const displayedPriceHistory = rows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const headers = [
    t("colNo"),
    t("colCropName"),
    t("colCropType"),
    t("colRegion"),
    t("colPrice"),
    t("colChange"),
    t("colDate"),
  ];

  return (
    <div
      className={`rounded-[28px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      <div className="mb-6">
        <p className="text-[13px] font-bold uppercase tracking-wide text-primary">
          {t("label")}
        </p>
        <div className="flex flex-row justify-between">
          <h2 className="mt-1 text-[22px] font-bold text-primary-heading">
            {t("title")}
          </h2>
          <Link href="/market-price">
            <button
              type="button"
              className="cursor-pointer text-[14px] font-semibold text-primary underline underline-offset-2"
            >
              {t("seeAll")}
            </button>
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[16px] bg-[#F7F9FB]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#D6DEE8]">
              {headers.map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#8A949C]"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedPriceHistory.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-[14px] text-muted"
                >
                  {t("noData")}
                </td>
              </tr>
            ) : (
              displayedPriceHistory.map((item, index) => {
                const changeLabel =
                  "changeLabel" in item
                    ? item.changeLabel
                    : `${item.changeAmount >= 0 ? "+" : ""}${item.changeAmount.toLocaleString()} (${item.changePercent >= 0 ? "+" : ""}${item.changePercent.toLocaleString()}%)`;
                const isPositive =
                  "isPositive" in item
                    ? item.isPositive
                    : item.changeAmount >= 0;

                return (
                  <tr
                    key={item.marketPriceId}
                    className="border-b border-[#D6DEE8] last:border-none"
                  >
                    <td className="px-4 py-3 text-[14px] font-semibold text-primary-heading">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td className="px-4 py-3 text-[14px] font-semibold text-primary-heading">
                      {item.cropName}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-primary-heading">
                      {item.cropTypeName}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-primary-heading">
                      {formatRegion(item.region)}
                    </td>
                    <td className="px-4 py-3 text-[14px] font-semibold text-primary-heading">
                      {item.currentPrice.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-[14px] font-semibold ${isPositive ? "text-[#72BF78]" : "text-[#FF333A]"}`}
                    >
                      {changeLabel}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-primary-heading">
                      {formatDate(item.effectiveDate)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <PaginationComponent
          currentPage={page}
          totalItems={rows.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          pageBase={1}
          size="sm"
          className="mt-5 border-0 px-0 py-0 shadow-none"
        />
      )}
    </div>
  );
}
