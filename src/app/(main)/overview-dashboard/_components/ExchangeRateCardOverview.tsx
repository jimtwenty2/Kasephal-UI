"use client";

import Image from "next/image";
import { ArrowLeftRightIcon } from "lucide-react";
import { useState } from "react";
import { ExchangeRate } from "@/services/exchange-rate.service";
import { useI18n } from "@/lib/i18n/I18nContext";

type Props = {
  exchangeRates?: ExchangeRate[];
};

const EXCHANGE_TEXT = {
  convert: { en: "Convert", kh: "បំប្លែង" },
  exchangeRate: { en: "Exchange Rate", kh: "អត្រាប្តូរប្រាក់" },
  from: { en: "From", kh: "ពី" },
  to: { en: "To", kh: "ទៅ" },
} as const;

export default function ExchangeRateCardOverview({
  exchangeRates = [],
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof EXCHANGE_TEXT) => EXCHANGE_TEXT[key][lang];

  const [isUsdToKhr, setIsUsdToKhr] = useState(true);
  const [amount, setAmount] = useState("");

  const usdKhr = exchangeRates?.find((r) => r.key === "USD/KHR");
  const rate = usdKhr ? parseFloat(usdKhr.average) : 4026;

  const converted = amount
    ? isUsdToKhr
      ? (Number(amount) * rate).toLocaleString()
      : (Number(amount) / rate).toFixed(2)
    : "00.00";

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
            {t("convert")}
          </p>
          <h2 className="mt-1 text-[24px] font-bold text-primary-heading">
            {t("exchangeRate")}
          </h2>
        </div>
        <p className="text-[18px] font-bold text-primary-heading">
          1 USD = {rate.toLocaleString()} KHR
        </p>
      </div>

      {/* Converter */}
      <div className="mt-6 grid items-end gap-5 md:grid-cols-[1fr_auto_1fr]">
        {/* From */}
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase text-muted">
            {t("from")}
          </p>
          <div className="flex h-17 items-center justify-between rounded-2xl border border-light-grey px-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="shrink-0 text-[20px] font-semibold text-secondary-body">
                {isUsdToKhr ? "$" : "៛"}
              </span>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9.]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="00.00"
                className="min-w-0 w-full appearance-none bg-transparent text-[28px] font-bold text-primary-heading outline-none placeholder:text-secondary-body [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-2">
              <Image
                src={
                  isUsdToKhr
                    ? "/assets/nav-bar/EN_image.png"
                    : "/assets/nav-bar/KH_image.png"
                }
                alt="Currency"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-[17px] font-bold text-secondary-body">
                {isUsdToKhr ? "USD" : "KHR"}
              </span>
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <button
          onClick={() => {
            setIsUsdToKhr(!isUsdToKhr);
            setAmount("");
          }}
          className="mb-[10px] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-white transition hover:scale-105"
        >
          <ArrowLeftRightIcon className="h-6 w-6" />
        </button>

        {/* To */}
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase text-muted">
            {t("to")}
          </p>
          <div className="flex h-17 items-center justify-between rounded-2xl border border-light-grey px-5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="shrink-0 text-[20px] font-semibold text-secondary-body">
                {isUsdToKhr ? "៛" : "$"}
              </span>
              <span className="truncate text-[28px] font-bold text-primary-heading">
                {converted}
              </span>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-2">
              <Image
                src={
                  isUsdToKhr
                    ? "/assets/nav-bar/KH_image.png"
                    : "/assets/nav-bar/EN_image.png"
                }
                alt="Currency"
                width={28}
                height={28}
                className="rounded-full"
              />
              <span className="text-[17px] font-bold text-secondary-body">
                {isUsdToKhr ? "KHR" : "USD"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
