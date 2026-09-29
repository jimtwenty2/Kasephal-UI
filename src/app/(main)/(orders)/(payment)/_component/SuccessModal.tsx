"use client";

import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  paymentSucceeded: {
    en: "Payment Succeeded",
    kh: "ការទូទាត់បានជោគជ័យ",
  },
  deliveryConfirmed: {
    en: "Delivery Confirmed",
    kh: "បានបញ្ជាក់ការដឹកជញ្ជូន",
  },
  paymentMessage: {
    en: "Your transaction funds have been safely added to the secure escrow system.",
    kh: "ប្រាក់ប្រតិបត្តិការរបស់អ្នកត្រូវបានបញ្ចូលទៅក្នុងប្រព័ន្ធ Escrow ដែលមានសុវត្ថិភាពដោយជោគជ័យ។",
  },
  deliveryMessage: {
    en: "The contract transaction is finished. Secured funds are now disbursed.",
    kh: "ប្រតិបត្តិការកិច្ចសន្យាត្រូវបានបញ្ចប់។ ប្រាក់ដែលបានរក្សាទុកដោយសុវត្ថិភាពត្រូវបានបញ្ចេញហើយ។",
  },
  done: {
    en: "DONE",
    kh: "រួចរាល់",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

interface SuccessModalProps {
  isOpen: boolean;
  type: "PAYMENT" | "DELIVERY";
  onClose: () => void;
}

export default function SuccessModal({
  isOpen,
  type,
  onClose,
}: SuccessModalProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  if (!isOpen) return null;

  const isPayment = type === "PAYMENT";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md scale-100 transform rounded-[32px] bg-white p-8 text-center shadow-2xl transition-all duration-300">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#3CD259]">
          <Check className="h-12 w-12 text-white" strokeWidth={3} />
        </div>

        <h2 className="heading font-extrabold tracking-tight text-black md:heading">
          {isPayment ? t("paymentSucceeded") : t("deliveryConfirmed")}
        </h2>

        <p className="mx-auto mt-3 max-w-[290px] text-base leading-relaxed text-desciption-text">
          {isPayment ? t("paymentMessage") : t("deliveryMessage")}
        </p>

        <div className="mt-8">
          <button
            type="button"
            onClick={onClose}
            className="w-full max-w-[160px] rounded-xl border-2 border-[#117C43] py-2.5 text-base font-bold text-primary transition-colors hover:bg-emerald-50"
          >
            {t("done")}
          </button>
        </div>
      </div>
    </div>
  );
}