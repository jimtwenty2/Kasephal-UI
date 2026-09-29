"use client";
import { BanknoteIcon, CreditCardIcon } from "lucide-react";
import { Contract } from "@/services/contract.service";
import { Order } from "@/services/order.service";
import { useI18n } from "@/lib/i18n/I18nContext";
import { CurrencyCode, KHR_COLOR } from "../_components/CurrencyToggle";
import { getActiveContractTotals } from "./dashboardFinance";

type Props = {
  contracts: Contract[];
  orders: Order[];
  currency: CurrencyCode;
};

function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatKHR(amount: number) {
  return new Intl.NumberFormat("km-KH", {
    style: "currency",
    currency: "KHR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatAmount(amount: number, currency: CurrencyCode) {
  return currency === "KHR" ? formatKHR(amount) : formatUSD(amount);
}

const PAYMENT_TEXT = {
  financials: { en: "Financials", kh: "ហិរញ្ញវត្ថុ" },
  summaryTitle: { en: "Active Contract Summary", kh: "សង្ខេបកិច្ចសញ្ញាសកម្ម" },
  totalContractValue: {
    en: "Total Active Contract Value",
    kh: "តម្លៃកិច្ចសញ្ញាសកម្មសរុប",
  },
  remainingPayment: {
    en: "Remaining Contract Payment",
    kh: "ការទូទាត់កិច្ចសញ្ញាដែលនៅសល់",
  },
} as const;

export default function PaymentSummaryOverview({
  contracts,
  orders,
  currency,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof PAYMENT_TEXT) => PAYMENT_TEXT[key][lang];

  const isKHR = currency === "KHR";
  const { totalValue, remainingAmount } = getActiveContractTotals(
    contracts,
    orders,
    currency,
  );

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
          {t("financials")}
        </p>
        <h2 className="mt-1 text-[24px] font-bold text-primary-heading">
          {t("summaryTitle")}
        </h2>
      </div>

      {/* Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Total Contract Value */}
        <div className="flex items-center justify-between rounded-[16px] border border-light-grey p-5">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold uppercase tracking-wide text-muted">
              {t("totalContractValue")}
            </p>
            <h3 className="mt-2 text-[22px] font-bold leading-tight text-primary-heading">
              {formatAmount(totalValue, currency)}
            </h3>
          </div>
          <div
            className="ml-3 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px]"
            style={{ backgroundColor: isKHR ? "#FEF9EC" : "#EEF7F0" }}
          >
            <BanknoteIcon
              className="h-6 w-6"
              style={{ color: isKHR ? KHR_COLOR : "#2D7A3A" }}
            />
          </div>
        </div>

        {/* Remaining Payment */}
        <div className="flex items-center justify-between rounded-[16px] border border-light-grey p-5">
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold uppercase tracking-wide text-muted">
              {t("remainingPayment")}
            </p>
            <h3 className="mt-2 text-[22px] font-bold leading-tight text-primary-heading">
              {formatAmount(remainingAmount, currency)}
            </h3>
          </div>
          <div
            className="ml-3 flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[14px]"
            style={{ backgroundColor: isKHR ? "#FEF9EC" : "#EEF7F0" }}
          >
            <CreditCardIcon
              className="h-6 w-6"
              style={{ color: isKHR ? KHR_COLOR : "#2D7A3A" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
