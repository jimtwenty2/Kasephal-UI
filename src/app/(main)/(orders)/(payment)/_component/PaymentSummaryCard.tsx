"use client";

import type { EscrowPayment } from "../_types/payment";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  paymentSummary: {
    en: "Order Summary",
    kh: "សង្ខេបការទូទាត់",
  },
  escrowActive: {
    en: "● ESCROW ACTIVE",
    kh: "● ESCROW កំពុងដំណើរការ",
  },
  buyerGovName: {
    en: "Buyer",
    kh: "ឈ្មោះអ្នកទិញ / មន្ត្រីរដ្ឋាភិបាល",
  },
  farmerName: {
    en: "Farmer",
    kh: "ឈ្មោះកសិករ",
  },
  productName: {
    en: "Crop",
    kh: "ឈ្មោះផលិតផល",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

export default function PaymentSummaryCard({
  payment,
}: {
  payment: EscrowPayment;
}) {
  const { language } = useI18n();
  const t = getText(language as Language);

  return (
    <div className="rounded-[22px] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="title font-bold">{t("paymentSummary")}</h3>

        <span className="rounded-full bg-blue-50 px-3 py-1 sub-title font-bold text-blue-600">
          {language === "kh" ? t("escrowActive") : "Contract Order"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <p className="sub-title font-bold uppercase text-description-text">
            {t("buyerGovName")}
          </p>
          <p className="mt-1 font-semibold text-primary-heading">
            {payment.buyerName}
          </p>
        </div>

        <div>
          <p className="sub-title font-bold uppercase text-description-text">
            {t("farmerName")}
          </p>
          <p className="mt-1 font-semibold text-primary-heading">
            {payment.farmerName}
          </p>
        </div>

        <div>
          <p className="sub-title font-bold uppercase text-description-text">
            {t("productName")}
          </p>
          <p className="mt-1 font-semibold text-primary-heading">
            {payment.productName}
          </p>
        </div>
      </div>
    </div>
  );
}
