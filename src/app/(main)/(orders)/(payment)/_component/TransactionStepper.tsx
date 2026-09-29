"use client";

import { Check, Circle, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { EscrowFlowStatus } from "../_types/payment";

const TEXT = {
  transactionStatus: {
    en: "Payment Status",
    kh: "ស្ថានភាពប្រតិបត្តិការ",
  },

  khqrGenerated: {
    en: "QR Code Ready",
    kh: "KHQR ត្រូវបានបង្កើត",
  },

  khqrExpired: {
    en: "QR Code Expired",
    kh: "KHQR ផុតកំណត់",
  },

  activeSingleUseQr: {
    en: "Scan the QR code to pay.",
    kh: "QR សម្រាប់ប្រើប្រាស់តែម្តង និងកំពុងដំណើរការ",
  },

  qrExpiredDescription: {
    en: "Generate a new QR code.",
    kh: "បានដល់កំណត់រយៈពេល ៥ នាទី",
  },

  paymentSuccessful: {
    en: "Payment Received",
    kh: "ការទូទាត់ជោគជ័យ",
  },

  waitingBuyerScan: {
    en: "Waiting for payment.",
    kh: "កំពុងរង់ចាំអ្នកទិញស្កេន...",
  },

  verifiedByClearingSystem: {
    en: "Payment confirmed.",
    kh: "បានផ្ទៀងផ្ទាត់ដោយប្រព័ន្ធទូទាត់",
  },

  fundsLockedInEscrow: {
    en: "Order Updated",
    kh: "ប្រាក់ត្រូវបានរក្សាទុកក្នុង Escrow",
  },

  securedSafelyBySystem: {
    en: "The farmer will be notified.",
    kh: "រក្សាទុកដោយសុវត្ថិភាពដោយប្រព័ន្ធ",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

interface TransactionStepperProps {
  flowStatus: EscrowFlowStatus;
  isRemainingPaid: boolean;
}

export default function TransactionStepper({
  flowStatus,
  isRemainingPaid,
}: TransactionStepperProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  const getStepStatus = (
    step: "GENERATED" | "SUCCESS" | "LOCKED" | "APPROVED",
  ) => {
    if (flowStatus === "WITHDRAWAL_APPROVED") return "done";
    if (isRemainingPaid && step !== "APPROVED") return "done";

    switch (step) {
      case "GENERATED":
        if (flowStatus === "IDLE") return "pending";
        if (flowStatus === "QR_EXPIRED") return "failed";
        return "done";

      case "SUCCESS":
        if (flowStatus === "PAYMENT_SUCCESS") return "done";
        if (flowStatus === "HOLD_PAYMENT" || flowStatus === "REDIRECTING")
          return "done";
        if (flowStatus === "KHQR_READY") return "active";
        return "pending";

      case "LOCKED":
        if (flowStatus === "PAYMENT_SUCCESS") return "active";
        if (flowStatus === "HOLD_PAYMENT" || flowStatus === "REDIRECTING")
          return "done";
        return "pending";

      case "APPROVED":
        return "pending";

      default:
        return "pending";
    }
  };

  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mb-5 title">{t("transactionStatus")}</h3>

      <div className="space-y-5">
        <StepperItem
          status={getStepStatus("GENERATED")}
          title={
            flowStatus === "QR_EXPIRED"
              ? t("khqrExpired")
              : t("khqrGenerated")
          }
          description={
            flowStatus === "QR_EXPIRED"
              ? t("qrExpiredDescription")
              : t("activeSingleUseQr")
          }
        />

        <StepperItem
          status={getStepStatus("SUCCESS")}
          title={t("paymentSuccessful")}
          description={
            flowStatus === "KHQR_READY"
              ? t("waitingBuyerScan")
              : t("verifiedByClearingSystem")
          }
        />

        <StepperItem
          status={getStepStatus("LOCKED")}
          title={t("fundsLockedInEscrow")}
          description={t("securedSafelyBySystem")}
        />
      </div>
    </div>
  );
}

function StepperItem({
  status,
  title,
  description,
}: {
  status: "done" | "active" | "pending" | "failed";
  title: string;
  description: string;
}) {
  const icon =
    status === "done" ? (
      <Check size={15} />
    ) : status === "active" ? (
      <Loader2 size={15} className="animate-spin" />
    ) : status === "failed" ? (
      <span className="sub-title font-bold">X</span>
    ) : (
      <Circle size={15} />
    );

  const circleClass =
    status === "done"
      ? "bg-emerald-600 text-white"
      : status === "active"
        ? "bg-amber-100 text-amber-600"
        : status === "failed"
          ? "bg-red-100 text-red-600"
          : "bg-slate-100 text-description-text";

  return (
    <div className="flex gap-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${circleClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="font-bold text-[#252525]">{title}</p>

        <p
          className={`sub-title ${
            status === "active"
              ? "text-amber-500"
              : "text-description-text"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
