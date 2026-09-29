"use client";

import { MarketPrice } from "@/types/market-price";
import StatsCard from "../StatsCardComponent";
import Image from "next/image";
import type { ExchangeRate } from "@/services/exchange-rate.service";
import { useMarketPriceText } from "../marketPriceText";

function ExchangeRateCard({ exchangeRate }: { exchangeRate?: ExchangeRate }) {
  const { t, fontClass } = useMarketPriceText();

  return (
    <div className={`relative flex flex-col justify-between rounded-2xl border-border shadow-sm bg-white px-5 py-4 min-w-0 ${fontClass}`}>
      <p className="text-[14px] font-medium tracking-[0.15em] uppercase text-[#94A3B8]">
        {t("market.exchangeRate")}
      </p>

      <div className="mt-3 text-[24px] font-extrabold leading-none text-primary-heading">
        {exchangeRate
          ? `1.00 USD = ${Number(exchangeRate.average).toLocaleString(
              undefined,
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )} KHR`
          : "N/A"}
      </div>

      <div className="mt-1 text-[13px] text-description-text">USD/KHR</div>

      {/* Flag pair — bottom right */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1">
        <div>
          <Image
            src="/assets/nav-bar/EN_image.png"
            alt="EN"
            width={24}
            height={24}
          />
        </div>
        {/* swap arrows */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.33383 6.00682L5.67383 2.66016"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.666 6.00586H2.33268"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13.666 9.99414L10.326 13.3408"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.33268 9.99414H13.666"
            stroke="#292D32"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <Image
          src="/assets/nav-bar/KH_image.png"
          alt="KH"
          width={24}
          height={24}
        />
      </div>
    </div>
  );
}

interface MarketOverviewProps {
  highestPriceCrop: MarketPrice | null;
  lowestPriceCrop: MarketPrice | null;

  highestPriceInKHR: number;
  lowestPriceInKHR: number;

  totalCropTypes: number;
  exchangeRate?: ExchangeRate;
}

export default function MarketOverview({
  highestPriceCrop,
  lowestPriceCrop,
  highestPriceInKHR,
  lowestPriceInKHR,
  totalCropTypes,
  exchangeRate,
}: MarketOverviewProps) {
  const { t, fontClass } = useMarketPriceText();

  return (
    <div className={fontClass}>
      <section className="w-full py-6">
        {/* Heading */}
        <div>
          <p className="title uppercase text-primary mb-0.5">{t("market.summary.label")}</p>
          <h2 className="mb-5 text-[32px] font-extrabold leading-none text-primary-heading">
            {t("market.overview.title")}
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Highest Price Crop */}
          <StatsCard
            title={t("market.stats.highest")}
            content={
              highestPriceCrop
                ? `${highestPriceInKHR.toLocaleString()} KHR`
                : "-"
            }
            footer={highestPriceCrop?.crop.cropName ?? t("market.stats.noData")}
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.75 7.91602L10.25 11.416L8.91667 9.41602L6.25 12.0827"
                  stroke="#0D7858"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.084 7.91602H13.7507V9.58268"
                  stroke="#0D7858"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.49935 18.3327H12.4993C16.666 18.3327 18.3327 16.666 18.3327 12.4993V7.49935C18.3327 3.33268 16.666 1.66602 12.4993 1.66602H7.49935C3.33268 1.66602 1.66602 3.33268 1.66602 7.49935V12.4993C1.66602 16.666 3.33268 18.3327 7.49935 18.3327Z"
                  stroke="#0D7858"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          {/* Lowest Price Crop */}
          <StatsCard
            title={t("market.stats.lowest")}
            content={
              lowestPriceCrop ? `${lowestPriceInKHR.toLocaleString()} KHR` : "-"
            }
            footer={lowestPriceCrop?.crop.cropName ?? t("market.stats.noData")}
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.75 12.0827L10.25 8.58268L8.91667 10.5827L6.25 7.91602"
                  stroke="#0D7858"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.084 12.0827H13.7507V10.416"
                  stroke="#0D7858"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.49935 18.3327H12.4993C16.666 18.3327 18.3327 16.666 18.3327 12.4993V7.49935C18.3327 3.33268 16.666 1.66602 12.4993 1.66602H7.49935C3.33268 1.66602 1.66602 3.33268 1.66602 7.49935V12.4993C1.66602 16.666 3.33268 18.3327 7.49935 18.3327Z"
                  stroke="#0D7858"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          {/* Total Crop Type */}
          <StatsCard
            title={t("market.stats.totalCropType")}
            content={totalCropTypes}
            footer={t("market.stats.types")}
            icon={
              <svg
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.83398 16.666H14.1673"
                  stroke="#107446"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.33398 16.6673C12.9173 14.584 9.00065 11.334 10.834 8.33398"
                  stroke="#107446"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7.91732 7.83349C8.83398 8.50016 9.41732 9.66683 9.83398 10.9168C8.16732 11.2502 6.91732 11.2502 5.83398 10.6668C4.83398 10.1668 3.91732 9.08349 3.33398 7.16683C5.66732 6.75016 7.00065 7.16683 7.91732 7.83349Z"
                  stroke="#107446"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.7498 5.00065C11.1145 5.99362 10.7949 7.15577 10.8332 8.33398C12.4165 8.25065 13.5832 7.83398 14.4165 7.16732C15.2498 6.33398 15.7498 5.25065 15.8332 3.33398C13.5832 3.41732 12.4998 4.16732 11.7498 5.00065Z"
                  stroke="#107446"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />

          {/* Exchange Rate — custom layout */}
          <ExchangeRateCard exchangeRate={exchangeRate} />
        </div>
      </section>
    </div>
  );
}
