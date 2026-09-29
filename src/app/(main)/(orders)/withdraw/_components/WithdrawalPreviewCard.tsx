"use client";

import {
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  currencySymbol,
  type RequestCurrency,
} from "@/utils/requestPaymentAmount";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  amount: {
    en: "Amount",
    kh: "ចំនួនទឹកប្រាក់",
  },
  additionalNotes: {
    en: "Additional Notes",
    kh: "កំណត់សម្គាល់បន្ថែម",
  },
  noNotesYet: {
    en: "No notes yet.",
    kh: "មិនទាន់មានកំណត់សម្គាល់ទេ។",
  },
  withdrawalReview: {
    en: "Withdrawal Review",
    kh: "ការត្រួតពិនិត្យការដកប្រាក់",
  },
  reviewOnly: {
    en: "Review Only",
    kh: "សម្រាប់ពិនិត្យប៉ុណ្ណោះ",
  },
  requestPreview: {
    en: "Request Preview",
    kh: "មើលសំណើជាមុន",
  },
  previewOnly: {
    en: "This card is only for preview.",
    kh: "កាតនេះសម្រាប់មើលជាមុនតែប៉ុណ្ណោះ។",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

type WithdrawalPreviewCardProps = {
  amount: string;
  notes: string;
  currencyCode: RequestCurrency;
  amountLabel?: string;
  notesLabel?: string;
  notesEmptyText?: string;
  reviewTitle?: string;
};

export default function WithdrawalPreviewCard({
  amount,
  notes,
  currencyCode,
  amountLabel,
  notesLabel,
  notesEmptyText,
  reviewTitle,
}: WithdrawalPreviewCardProps) {
  const { language } = useI18n();
  const t = getText(language as Language);

  const displayAmountLabel = amountLabel ?? t("amount");
  const displayNotesLabel = notesLabel ?? t("additionalNotes");
  const displayNotesEmptyText = notesEmptyText ?? t("noNotesYet");
  const displayReviewTitle = reviewTitle ?? t("withdrawalReview");

  return (
    <div className="rounded-2xl border border-light-grey bg-white p-6 shadow-sm">
      <div className="h-1 w-full rounded-full bg-primary" />

      <div className="mt-6 flex items-start justify-between">
        <div>
          <p className="text-primary text-[11px] font-bold uppercase">
            {t("reviewOnly")}
          </p>

          <h2 className="mt-1 text-[22px] font-bold text-primary-heading">
            {t("requestPreview")}
          </h2>
        </div>

        <div className="rounded-full bg-[#E7F1EC] p-3">
          <ClipboardDocumentCheckIcon className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="my-5 border-b border-light-grey" />

      <div className="space-y-5">
        <div className="rounded-[14px] bg-[#F7F9FB] p-5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-primary-heading">
              {displayAmountLabel}
            </span>

            <span className="text-[22px] font-bold text-primary">
              {currencySymbol(currencyCode)}
              {amount || "0.00"}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-light-grey p-4">
          <p className="text-[13px] text-secondary-body">
            {displayNotesLabel}
          </p>

          <p className="mt-2 text-[14px] leading-6 text-primary-heading">
            {notes || displayNotesEmptyText}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
            <BanknotesIcon className="h-5 w-5 text-green-700" />
          </div>

          <div>
            <p className="text-[13px] font-bold text-green-800">
              {displayReviewTitle}
            </p>

            <p className="mt-1 text-[12px] text-green-700">
              {t("previewOnly")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}