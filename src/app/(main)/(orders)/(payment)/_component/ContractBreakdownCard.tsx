"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  information: {
    en: "Payment Details",
    kh: "ព័ត៌មាន",
  },
  totalQty: {
    en: "Quantity",
    kh: "បរិមាណសរុប",
  },
  totalPrice: {
    en: "Total Price",
    kh: "តម្លៃសរុប",
  },
  totalPayment: {
    en: "Amount to Pay",
    kh: "ការទូទាត់សរុប",
  },
  contractBreakdown: {
    en: "Payment Details",
    kh: "ការបែងចែកកិច្ចសន្យា",
  },
  depositRequired: {
    en: "Deposit",
    kh: "ប្រាក់កក់ដែលត្រូវបង់",
  },
  remainingBalance: {
    en: "Remaining",
    kh: "ប្រាក់ដែលនៅសល់",
  },
  totalContract: {
    en: "Order Total",
    kh: "កិច្ចសន្យាសរុប",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

interface ContractBreakdownCardProps {
  isDirectPayment?: boolean;
  depositAmount: number;
  remainingBalance: number;
  totalAmount: number;
  depositPercent: number;
  currencyCode: "USD" | "KHR";
  qty?: string;
  productName?: string;
  paymentLabel?: string;
  remainingLabel?: string;
}

export default function ContractBreakdownCard({
  isDirectPayment = false,
  depositAmount,
  remainingBalance,
  totalAmount,
  depositPercent,
  currencyCode,
  qty = "50Ton",
  paymentLabel,
  remainingLabel,
}: ContractBreakdownCardProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  if (isDirectPayment) {
    return (
      <div className="rounded-[22px] border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold text-primary-heading">
          {t("information")}
        </h3>

        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="font-medium text-description-text">{t("totalQty")}</p>
          <p className="font-bold text-primary-heading">{qty}</p>
        </div>

        <div className="mb-4 flex items-center justify-between text-sm">
          <p className="font-medium text-description-text">
            {t("totalPrice")}
          </p>
          <p className="font-bold text-description-text">
            {formatCurrency(totalAmount, currencyCode)}
          </p>
        </div>

        <div className="my-5 h-px bg-gray-100" />

        <div className="flex items-center justify-between text-base font-bold">
          <p className="text-[#222222]">{t("totalPayment")}</p>
          <p className="text-xl text-black">
            {formatCurrency(totalAmount, currencyCode)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-bold text-black">
        {t("contractBreakdown")}
      </h3>

      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="font-medium text-description-text">
          {paymentLabel ?? `${t("depositRequired")} (${depositPercent}%)`}
        </p>
        <p className="font-bold text-[#252525]">
          {formatCurrency(depositAmount, currencyCode)}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm">
        <p className="font-medium text-description-text">
          {remainingLabel ?? t("remainingBalance")}
        </p>
        <p className="font-bold text-[#252525]">
          {formatCurrency(remainingBalance, currencyCode)}
        </p>
      </div>

      <div className="my-5 h-px bg-slate-200" />

      <div className="flex items-center justify-between text-base font-bold">
        <p className="text-[#222222]">{t("totalContract")}</p>
        <p className="text-[#222222]">
          {formatCurrency(totalAmount, currencyCode)}
        </p>
      </div>
    </div>
  );
}
