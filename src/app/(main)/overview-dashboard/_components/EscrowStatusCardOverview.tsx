"use client";
import { useI18n } from "@/lib/i18n/I18nContext";
import { Contract } from "@/services/contract.service";
import { Order } from "@/services/order.service";
import { CurrencyCode, KHR_COLOR } from "../_components/CurrencyToggle";
import { getActiveContractTotals } from "./dashboardFinance";

type Props = {
  contracts: Contract[];
  orders: Order[];
  currency: CurrencyCode;
};

const ESCROW_TEXT = {
  transaction: { en: "Transaction", kh: "ប្រតិបត្តិការ" },
  escrowStatus: { en: "Escrow Status", kh: "ស្ថានភាព Escrow" },
  inEscrow: { en: "In Escrow", kh: "នៅក្នុង Escrow" },
  ofContractValue: {
    en: "Of active contract value",
    kh: "នៃតម្លៃកិច្ចសញ្ញាសកម្ម",
  },
} as const;

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

const USD_COLOR = "#2D7A3A";

function EscrowRing({
  escrowBalance,
  percentage,
  currency,
  label,
}: {
  escrowBalance: number;
  percentage: number;
  currency: CurrencyCode;
  label: { inEscrow: string; ofContractValue: string };
}) {
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (percentage / 100) * circumference;
  const ringColor = currency === "KHR" ? KHR_COLOR : USD_COLOR;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[20px] font-bold text-primary-heading">
            {formatAmount(escrowBalance, currency)}
          </span>
          <span className="text-[12px] text-secondary-body">
            {label.inEscrow}
          </span>
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center">
        <span className="text-[22px] font-bold text-primary-heading">
          {percentage}%
        </span>
        <span className="text-[13px] text-secondary-body">
          {label.ofContractValue}
        </span>
      </div>
    </div>
  );
}

export default function EscrowStatusCardOverview({
  contracts,
  orders,
  currency,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof ESCROW_TEXT) => ESCROW_TEXT[key][lang];

  const { totalValue: contractValue, escrowBalance } = getActiveContractTotals(
    contracts,
    orders,
    currency,
  );
  const percentage =
    contractValue > 0 ? Math.round((escrowBalance / contractValue) * 100) : 0;

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
          {t("transaction")}
        </p>
        <h2 className="mt-1 text-[24px] font-bold text-primary-heading">
          {t("escrowStatus")}
        </h2>
      </div>

      {/* Donut ring */}
      <div className="my-6 flex justify-center">
        <EscrowRing
          escrowBalance={escrowBalance}
          percentage={percentage}
          currency={currency}
          label={{
            inEscrow: t("inEscrow"),
            ofContractValue: t("ofContractValue"),
          }}
        />
      </div>
    </div>
  );
}
