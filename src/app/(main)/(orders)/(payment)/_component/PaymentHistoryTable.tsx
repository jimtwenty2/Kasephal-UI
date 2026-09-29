"use client";

import type { EscrowPayment } from "../_types/payment";
import { formatCurrency } from "../_utils/formartCurrency";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  paymentHistory: {
    en: "Payment History",
    kh: "ប្រវត្តិការទូទាត់",
  },
  paymentId: {
    en: "Payment ID",
    kh: "លេខសម្គាល់ការទូទាត់",
  },
  amount: {
    en: "Amount",
    kh: "ចំនួនទឹកប្រាក់",
  },
  status: {
    en: "Status",
    kh: "ស្ថានភាព",
  },
  method: {
    en: "Method",
    kh: "វិធីសាស្ត្រ",
  },
  paidAt: {
    en: "Paid At",
    kh: "បានបង់នៅ",
  },
  paid: {
    en: "PAID",
    kh: "បានបង់",
  },
  pending: {
    en: "PENDING",
    kh: "កំពុងរង់ចាំ",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

function normalizePaymentStatus(status: string) {
  const normalizedStatus = String(status ?? "").toUpperCase();

  if (normalizedStatus === "SUCCESS") return "PAID";
  if (normalizedStatus === "PAID") return "PAID";
  if (normalizedStatus === "PENDING") return "PENDING";

  return normalizedStatus;
}

function formatPaidAt(value?: string | null) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  hours %= 12;
  const displayHours = hours === 0 ? 12 : hours;

  return `${day} ${month}, ${year} ${displayHours}:${minutes} ${period}`;
}

interface PaymentHistoryTableProps {
  paymentHistory: NonNullable<EscrowPayment["paymentHistory"]>;
  isRemainingPaid: boolean;
  flowStatus: string;
  isDirectPayment: boolean;
}

export default function PaymentHistoryTable({
  paymentHistory,
  isRemainingPaid,
  flowStatus,
  isDirectPayment,
}: PaymentHistoryTableProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  const todayFormatted = formatPaidAt(new Date().toISOString());

  const getDisplayStatus = (status: string) => {
    const normalizedStatus = normalizePaymentStatus(status);

    if (normalizedStatus === "PAID") return t("paid");
    if (normalizedStatus === "PENDING") return t("pending");
    return normalizedStatus;
  };

  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-100 bg-white shadow-sm">
      <div className="px-6 py-5">
        <h3 className="title text-lg font-bold text-black">
          {t("paymentHistory")}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="sub-title w-full min-w-[720px] text-sm">
          <thead className="sub-title bg-slate-50/50 text-xs uppercase tracking-wider text-description-text">
            <tr>
              <th className="px-6 py-4 text-left font-semibold text-gray-500">
                {t("paymentId")}
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500">
                {t("amount")}
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500">
                {t("status")}
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500">
                {t("method")}
              </th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500">
                {t("paidAt")}
              </th>
            </tr>
          </thead>

          <tbody>
            {paymentHistory?.map((item, index) => {
              const rowStatus = normalizePaymentStatus(item.status);
              const rowIsPaid = rowStatus === "PAID";
              const fallbackPaid = isDirectPayment
                ? flowStatus === "HOLD_PAYMENT" || isRemainingPaid
                : isRemainingPaid;
              const displayStatus = rowStatus || (fallbackPaid ? "PAID" : "PENDING");
              const displayMethod = item.method || "KHQR";
              const displayPaidAt = rowIsPaid
                ? formatPaidAt(item.paidAt) || todayFormatted
                : "---";

              return (
                <tr
                  key={item.paymentId || index}
                  className="border-t border-slate-100 text-gray-700"
                >
                  <td className="px-6 py-4 font-semibold text-[#222222]">
                    {item.paymentId || `TXN-${1000 + index}`}
                  </td>

                  <td className="px-6 py-4 font-semibold text-gray-600">
                    {formatCurrency(item.amount)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        displayStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {getDisplayStatus(displayStatus)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-500">{displayMethod}</td>
                  <td className="px-6 py-4 text-gray-400">{displayPaidAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
