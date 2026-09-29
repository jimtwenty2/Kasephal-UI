"use client";

import { Clock3 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { EscrowFlowStatus } from "../_types/payment";

const TEXT = {
  allSecured: {
    en: "Payment Complete",
    kh: "បានរក្សាទុកដោយសុវត្ថិភាពទាំងអស់",
  },
  payRemainingBalance: {
    en: "Pay Balance",
    kh: "បង់ប្រាក់ដែលនៅសល់",
  },
  payWithKhqr: {
    en: "Pay with KHQR",
    kh: "ទូទាត់តាម KHQR",
  },

  paymentSettled: {
    en: "Payment has been completely settled.",
    kh: "ការទូទាត់ត្រូវបានបញ្ចប់ទាំងស្រុង។",
  },
  contractPaidEscrow: {
    en: "Your payment has been received.",
    kh: "កិច្ចសន្យាត្រូវបានបង់ចូលក្នុង Escrow ទាំងស្រុង។",
  },
  qrExpiredDescription: {
    en: "QR code expired. Please generate a new one.",
    kh: "QR Code បានផុតកំណត់។ សូមបង្កើតថ្មីម្តងទៀត។",
  },
  settleRemainingAmount: {
    en: "Generate a QR code to pay the balance.",
    kh: "បង្កើត QR Code ដើម្បីបង់ប្រាក់ដែលនៅសល់។",
  },
  clickPaymentButton: {
    en: "Click Pay Now to scan the QR code.",
    kh: "ចុចប៊ូតុងទូទាត់ ដើម្បីស្កេន QR",
  },

  expired: {
    en: "Expired",
    kh: "ផុតកំណត់",
  },
  expiresIn: {
    en: "Expires in",
    kh: "ផុតកំណត់នៅក្នុង",
  },

  paymentCompleted: {
    en: "Payment Completed",
    kh: "ការទូទាត់បានបញ្ចប់",
  },
  retryPayment: {
    en: "Retry Payment",
    kh: "ព្យាយាមទូទាត់ម្តងទៀត",
  },
  awaitingPayment: {
    en: "Open QR",
    kh: "កំពុងរង់ចាំការទូទាត់...",
  },
  payRemainingBalanceNow: {
    en: "Pay Balance",
    kh: "បង់ប្រាក់ដែលនៅសល់ឥឡូវនេះ",
  },
  paymentNow: {
    en: "Pay Now",
    kh: "ទូទាត់ឥឡូវនេះ",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

interface KhqrPaymentCardProps {
  depositAmount: number;
  remainingBalance: number;
  paymentAmount: number;
  maxPaymentAmount: number;
  currencyCode: "USD" | "KHR";
  formattedTime: string;
  flowStatus: EscrowFlowStatus;
  isRemainingPaid: boolean;
  onPaymentNow: () => void;
  onRetry: () => void;
  onPaymentAmountChange: (amount: number) => void;
  isDirectPayment: boolean;
  isAmountLocked?: boolean;
  actionDisabled?: boolean;
  actionDisabledText?: string;
  paymentPurpose?: "deposit" | "remaining" | "direct";
}

export default function KhqrPaymentCard({
  depositAmount,
  remainingBalance,
  paymentAmount,
  maxPaymentAmount,
  currencyCode,
  formattedTime,
  flowStatus,
  isRemainingPaid,
  onPaymentNow,
  onRetry,
  onPaymentAmountChange,
  isDirectPayment,
  isAmountLocked = false,
  actionDisabled = false,
  actionDisabledText,
  paymentPurpose = "direct",
}: KhqrPaymentCardProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  const isExpired = flowStatus === "QR_EXPIRED";
  const isReady = flowStatus === "KHQR_READY";
  const hasPaidDeposit = flowStatus === "HOLD_PAYMENT";
  const isDepositPayment = paymentPurpose === "deposit";
  const isRemainingPayment = paymentPurpose === "remaining";

  const cardTitle = isRemainingPaid
    ? t("allSecured")
    : isDepositPayment
      ? "Pay Contract Deposit"
      : isRemainingPayment || hasPaidDeposit
      ? "Pay Approved Remaining Payment"
      : t("payWithKhqr");

  const pDescription = isRemainingPaid
    ? isDirectPayment
      ? t("paymentSettled")
      : t("contractPaidEscrow")
    : isExpired
      ? t("qrExpiredDescription")
      : isDepositPayment
        ? "Scan the QR to pay the deposit required by the accepted contract."
        : isRemainingPayment || hasPaidDeposit
        ? "Scan the QR to pay the remaining amount approved by the farmer."
        : t("clickPaymentButton");

  const displayedAmount = isRemainingPaid
    ? 0
    : isDirectPayment
      ? depositAmount + remainingBalance
      : hasPaidDeposit
        ? remainingBalance
        : paymentAmount;

  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-6 text-center shadow-sm">
      <h3 className="title text-lg font-bold text-black">
        {cardTitle}
      </h3>

      <p className="mt-1 text-sm text-description-text">
        {pDescription}
      </p>

      <h2 className="mt-6 text-4xl font-bold text-black">
        {formatCurrency(displayedAmount, currencyCode)}
      </h2>

      {!isRemainingPaid && (
        <label className="mt-5 block text-left text-xs font-bold text-description-text">
          Amount to pay
          <input
            type="number"
            min={currencyCode === "KHR" ? 1 : 0.01}
            max={maxPaymentAmount}
            step={currencyCode === "KHR" ? 1 : 0.01}
            value={paymentAmount}
            readOnly={isAmountLocked}
            disabled={isAmountLocked}
            onChange={(event) => {
              const nextAmount = Number(event.target.value);
              onPaymentAmountChange(Number.isFinite(nextAmount) ? nextAmount : 0);
            }}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-primary-heading outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-500"
          />
        </label>
      )}

      {!hasPaidDeposit && !isRemainingPaid && (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-amber-500">
          <Clock3 size={17} />
          <span>
            {isExpired
              ? t("expired")
              : `${t("expiresIn")} ${formattedTime}`}
          </span>
        </div>
      )}

      {isRemainingPaid ? (
        <button
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white opacity-90"
        >
          {t("paymentCompleted")}
        </button>
      ) : isExpired ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-600"
        >
          {t("retryPayment")}
        </button>
      ) : (
        <button
          type="button"
          onClick={onPaymentNow}
          disabled={actionDisabled}
          className="mt-6 w-full rounded-full bg-amber-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {actionDisabled
            ? actionDisabledText ?? t("paymentNow")
            : isReady
            ? t("awaitingPayment")
            : isDepositPayment
              ? "Pay Deposit"
            : isRemainingPayment || hasPaidDeposit
              ? t("payRemainingBalanceNow")
              : t("paymentNow")}
        </button>
      )}
    </div>
  );
}
