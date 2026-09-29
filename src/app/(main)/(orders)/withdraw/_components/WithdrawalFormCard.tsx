"use client";

import type { ReactNode } from "react";
import {
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  currencySymbol,
  formatRequestAmount,
  isKHR,
  sanitizeAmountInput,
  type RequestCurrency,
} from "@/utils/requestPaymentAmount";
import CurrencyToggle from "./CurrencyToggle";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  withdrawal: {
    en: "Withdrawal",
    kh: "ការដកប្រាក់",
  },
  newRequest: {
    en: "New Request",
    kh: "សំណើថ្មី",
  },
  requestCurrency: {
    en: "Request Currency",
    kh: "រូបិយប័ណ្ណសំណើ",
  },
  available: {
    en: "Available",
    kh: "សមតុល្យដែលអាចប្រើបាន",
  },
  amount: {
    en: "Amount *",
    kh: "ចំនួនទឹកប្រាក់ *",
  },
  enterWithdrawalAmount: {
    en: "Enter withdrawal amount",
    kh: "បញ្ចូលចំនួនទឹកប្រាក់ដែលត្រូវដក",
  },
  khrHint: {
    en: "Amount for KHR must be from 100",
    kh: "ចំនួនទឹកប្រាក់ជារៀលត្រូវមានយ៉ាងតិច ១០០៛",
  },
  reason: {
    en: "Reason *",
    kh: "មូលហេតុ *",
  },
  reasonPlaceholder: {
    en: "Describe why you need this withdrawal...",
    kh: "សូមពិពណ៌នាអំពីមូលហេតុនៃការដកប្រាក់នេះ...",
  },
  fullEscrowRefund: {
    en: "The full escrow balance will be refunded.",
    kh: "សមតុល្យ Escrow ទាំងមូលនឹងត្រូវសងត្រឡប់វិញ។",
  },
  amountExceedsBalance: {
    en: "Amount exceeds your available balance of",
    kh: "ចំនួនទឹកប្រាក់លើសពីសមតុល្យដែលអាចប្រើបានរបស់អ្នក",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

type WithdrawalFormCardProps = {
  amount?: string;
  setAmount?: (value: string) => void;
  hideAmountInput?: boolean;
  notes: string;
  setNotes: (value: string) => void;
  availableAmount: number;
  currencyCode: RequestCurrency;
  onCurrencyChange: (currency: RequestCurrency) => void;
  lockCurrency?: boolean;
  disabled?: boolean;
  eyebrow?: string;
  availableLabel?: string;
  amountLabel?: string;
  amountPlaceholder?: string;
  khrHint?: string;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  alert?: ReactNode;
};

export default function WithdrawalFormCard({
  amount = "",
  setAmount = () => {},
  hideAmountInput = false,
  notes,
  setNotes,
  availableAmount,
  currencyCode,
  onCurrencyChange,
  lockCurrency = false,
  disabled = false,
  eyebrow,
  availableLabel,
  amountLabel,
  amountPlaceholder,
  khrHint,
  reasonLabel,
  reasonPlaceholder,
  alert,
}: WithdrawalFormCardProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  const khr = isKHR(currencyCode);
  const exceedsAvailable = Number(amount || 0) > availableAmount;

  const displayEyebrow = eyebrow ?? t("withdrawal");
  const displayAvailableLabel = availableLabel ?? t("available");
  const displayAmountLabel = amountLabel ?? t("amount");
  const displayAmountPlaceholder =
    amountPlaceholder ?? t("enterWithdrawalAmount");
  const displayKhrHint = khrHint ?? t("khrHint");
  const displayReasonLabel = reasonLabel ?? t("reason");
  const displayReasonPlaceholder =
    reasonPlaceholder ?? t("reasonPlaceholder");

  return (
    <div className="rounded-2xl border border-light-grey bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-primary text-[11px] font-bold uppercase">
            {displayEyebrow}
          </p>

          <h2 className="mt-1 text-[22px] font-bold text-primary-heading">
            {t("newRequest")}
          </h2>
        </div>

        <div className="rounded-full bg-[#E7F1EC] p-3">
          <CurrencyDollarIcon className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="my-5 border-b border-light-grey" />

      {alert && <div className="mb-5">{alert}</div>}

      <div className="mt-6 space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-[14px] font-semibold text-primary-heading">
            {lockCurrency ? "Payment Currency" : t("requestCurrency")}
          </label>

          {lockCurrency ? (
            <span className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary">
              {currencyCode}
            </span>
          ) : (
            <CurrencyToggle
              value={currencyCode}
              onChange={onCurrencyChange}
              disabled={disabled}
            />
          )}
        </div>

        {hideAmountInput ? (
          <div>
            <label className="mb-2 block text-[14px] font-semibold text-primary-heading">
              {displayAmountLabel}
            </label>

            <div className="flex h-[52px] items-center justify-between rounded-xl border border-light-grey bg-[#F7F9FB] px-4">
              <span className="text-[13px] font-medium text-secondary-body">
                {displayAvailableLabel}
              </span>

              <span className="text-[22px] font-bold text-primary">
                {formatRequestAmount(availableAmount, currencyCode)}
              </span>
            </div>

            <p className="mt-1.5 text-[12px] text-secondary-body">
              {t("fullEscrowRefund")}
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-[14px] font-semibold text-red-500">
                {displayAmountLabel}
              </label>

              <span className="text-[12px] font-medium text-secondary-body">
                {displayAvailableLabel}:{" "}
                <span className="font-bold text-primary-heading">
                  {formatRequestAmount(availableAmount, currencyCode)}
                </span>
              </span>
            </div>

            <div
              className={`flex h-[52px] items-center gap-3 rounded-xl border px-4 transition ${
                exceedsAvailable
                  ? "border-red-400 focus-within:border-red-500"
                  : "border-light-grey focus-within:border-primary"
              }`}
            >
              <span className="text-[22px] font-bold text-primary">
                {currencySymbol(currencyCode)}
              </span>

              <input
                type="text"
                inputMode={khr ? "numeric" : "decimal"}
                placeholder={displayAmountPlaceholder}
                value={amount}
                disabled={disabled}
                onChange={(e) =>
                  setAmount(sanitizeAmountInput(e.target.value, currencyCode))
                }
                className="no-spinner w-full bg-transparent text-[15px] outline-none placeholder:text-secondary-body disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {exceedsAvailable ? (
              <p className="mt-1.5 text-[12px] font-medium text-red-500">
                {t("amountExceedsBalance")}{" "}
                {formatRequestAmount(availableAmount, currencyCode)}.
              </p>
            ) : (
              khr && (
                <p className="mt-1.5 text-[12px] text-secondary-body">
                  {displayKhrHint}
                </p>
              )
            )}
          </div>
        )}

        <div>
          <label className="mb-2 block text-[14px] font-semibold text-red-500">
            {displayReasonLabel}
          </label>

          <div className="rounded-xl border border-light-grey p-4 transition focus-within:border-primary">
            <div className="flex gap-3">
              <DocumentTextIcon className="mt-1 h-5 w-5 text-secondary-body" />

              <textarea
                placeholder={displayReasonPlaceholder}
                value={notes}
                maxLength={200}
                disabled={disabled}
                onChange={(e) => setNotes(e.target.value)}
                className="h-[100px] w-full resize-none bg-transparent text-[15px] text-gray-600 outline-none placeholder:text-secondary-body disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <p className="mt-2 text-right text-[12px] text-secondary-body">
            {notes.length}/200
          </p>
        </div>
      </div>
    </div>
  );
}
