"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createRequestPaymentAction } from "@/action/requestPayment.action";
import { showApiError, showApiToast } from "@/lib/apiToast";
import {
  toRequestCurrency,
  validateRequestAmount,
} from "@/utils/requestPaymentAmount";
import AlertBox from "./AlertBox";
import WithdrawalFormCard from "./WithdrawalFormCard";
import WithdrawalPreviewCard from "./WithdrawalPreviewCard";
import WithdrawalActions from "./WithdrawalActions";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  refundRequest: {
    en: "Refund Request",
    kh: "សំណើសងប្រាក់វិញ",
  },
  refundRequestDescription: {
    en: "Request a refund of the funds still held in escrow for this order.",
    kh: "ស្នើសុំសងប្រាក់វិញសម្រាប់ប្រាក់ដែលនៅតែរក្សាទុកក្នុង Escrow សម្រាប់ការបញ្ជាទិញនេះ។",
  },
  refund: {
    en: "Refund",
    kh: "សងប្រាក់វិញ",
  },
  refundable: {
    en: "Refundable",
    kh: "អាចសងវិញបាន",
  },
  refundAmount: {
    en: "Refund Amount",
    kh: "ចំនួនទឹកប្រាក់សងវិញ",
  },
  reasonForRefund: {
    en: "Reason for Refund *",
    kh: "មូលហេតុនៃការសងប្រាក់វិញ *",
  },
  reasonForRefundPreview: {
    en: "Reason for Refund",
    kh: "មូលហេតុនៃការសងប្រាក់វិញ",
  },
  reasonPlaceholder: {
    en: "Provide detailed context for the admin review...",
    kh: "សូមផ្តល់ព័ត៌មានលម្អិតសម្រាប់ការត្រួតពិនិត្យរបស់អ្នកគ្រប់គ្រង...",
  },
  unreleasedPaymentsOnly: {
    en: "Unreleased Payments Only",
    kh: "សម្រាប់ការទូទាត់ដែលមិនទាន់បានបញ្ចេញតែប៉ុណ្ណោះ",
  },
  unreleasedPaymentsDescription: {
    en: "Refunds apply to funds still held in escrow that haven't been released to the farmer.",
    kh: "ការសងប្រាក់វិញអនុវត្តចំពោះប្រាក់ដែលនៅតែរក្សាទុកក្នុង Escrow និងមិនទាន់បានបញ្ចេញទៅកសិករ។",
  },
  noReasonYet: {
    en: "No reason yet.",
    kh: "មិនទាន់មានមូលហេតុទេ។",
  },
  refundReview: {
    en: "Refund Review",
    kh: "ការត្រួតពិនិត្យសំណើសងប្រាក់វិញ",
  },
  submitRefundRequest: {
    en: "SUBMIT REFUND REQUEST",
    kh: "ដាក់ស្នើសំណើសងប្រាក់វិញ",
  },
  missingOrderReference: {
    en: "Missing order reference. Cannot submit request.",
    kh: "បាត់ព័ត៌មានយោងការបញ្ជាទិញ។ មិនអាចដាក់ស្នើសំណើបានទេ។",
  },
  noRefundableBalance: {
    en: "No refundable balance is available for this order.",
    kh: "មិនមានសមតុល្យដែលអាចសងវិញបានសម្រាប់ការបញ្ជាទិញនេះទេ។",
  },
  provideReason: {
    en: "Please provide a reason for this refund.",
    kh: "សូមផ្តល់មូលហេតុសម្រាប់ការសងប្រាក់វិញនេះ។",
  },
  unexpectedError: {
    en: "An unexpected error occurred. Please try again.",
    kh: "មានបញ្ហាមិនបានរំពឹងទុកកើតឡើង។ សូមព្យាយាមម្តងទៀត។",
  },
  requestSubmitted: {
    en: "Request submitted",
    kh: "បានដាក់សំណើ",
  },
  refundRequestSubmittedSuccess: {
    en: "Refund request submitted successfully.",
    kh: "សំណើសងប្រាក់វិញត្រូវបានដាក់ដោយជោគជ័យ។",
  },
  requestFailed: {
    en: "Request failed",
    kh: "សំណើបានបរាជ័យ",
  },
  failedSubmitRequest: {
    en: "Failed to submit request. Please try again.",
    kh: "មិនអាចដាក់សំណើបានទេ។ សូមព្យាយាមម្តងទៀត។",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

type BuyerRefundPageProps = {
  orderId?: string;
  availableAmount: number;
  orderCurrencyCode: string;
  hasBakongAccount: boolean;
  hasActiveRequest: boolean;
};

export default function BuyerRefundPage({
  orderId,
  availableAmount,
  orderCurrencyCode,
  hasBakongAccount,
  hasActiveRequest,
}: BuyerRefundPageProps) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getText(language as Language);

  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const currency = toRequestCurrency(orderCurrencyCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A refund can only be requested once the order's escrow is actually funded.
  const hasEscrowFunds = availableAmount > 0;

  const availableInSelected = availableAmount;

  const submittingRef = useRef(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (submittingRef.current) return;

    if (!orderId) {
      showApiError(new Error(t("missingOrderReference")));
      return;
    }

    if (!Number.isFinite(availableInSelected) || availableInSelected <= 0) {
      showApiError(new Error(t("noRefundableBalance")));
      return;
    }

    if (!hasBakongAccount) {
      showApiError(
        new Error("Please add your Bakong ID in your profile before requesting a refund."),
      );
      return;
    }

    if (hasActiveRequest) {
      showApiError(
        new Error("You already have an active refund request for this order."),
      );
      return;
    }

    const validation = validateRequestAmount(
      amount,
      availableInSelected,
      currency,
    );

    if (!validation.ok) {
      showApiError(new Error(validation.error));
      return;
    }

    if (!reason.trim()) {
      showApiError(new Error(t("provideReason")));
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    let result;

    try {
      result = await createRequestPaymentAction({
        orderId,
        requestType: "REFUND",
        amount: validation.amount,
        currencyCode: currency,
        reason: reason.trim(),
      });
    } catch (err) {
      submittingRef.current = false;
      setIsSubmitting(false);

      showApiError(
        err instanceof Error ? err : new Error(t("unexpectedError")),
      );

      return;
    }

    const isSuccess = showApiToast(result, {
      successTitle: t("requestSubmitted"),
      successMessage: t("refundRequestSubmittedSuccess"),
      errorTitle: t("requestFailed"),
      errorMessage: t("failedSubmitRequest"),
    });

    if (!isSuccess) {
      submittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    router.push("/order-history");
  };

  const handleCancel = () => {
    router.push(orderId ? `/order-history/${orderId}` : "/order-history");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h1 className="text-[28px] font-bold text-primary-heading">
          {t("refundRequest")}
        </h1>

        <p className="mt-2 text-[15px] font-medium text-secondary-body">
          {t("refundRequestDescription")}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <WithdrawalFormCard
          amount={amount}
          setAmount={setAmount}
          notes={reason}
          setNotes={setReason}
          availableAmount={availableInSelected}
          currencyCode={currency}
          onCurrencyChange={() => {}}
          lockCurrency
          disabled={
            isSubmitting ||
            !hasEscrowFunds ||
            !hasBakongAccount ||
            hasActiveRequest
          }
          eyebrow={t("refund")}
          availableLabel={t("refundable")}
          amountLabel={t("refundAmount")}
          reasonLabel={t("reasonForRefund")}
          reasonPlaceholder={t("reasonPlaceholder")}
          alert={
            !hasBakongAccount ? (
              <AlertBox
                type="warning"
                title="Bakong ID required"
                description="Add your Bakong ID in your profile before requesting a refund."
              />
            ) : hasActiveRequest ? (
              <AlertBox
                type="info"
                title="Refund request in review"
                description="You can submit another refund after the current request is completed or rejected, as long as escrow balance remains."
              />
            ) : hasEscrowFunds ? (
              <AlertBox
                type="info"
                title="Unreleased Payments Only"
                description="Refunds apply to funds still held in escrow that haven't been released to the farmer."
              />
            ) : (
              <AlertBox
                type="warning"
                title="No funds in escrow yet"
                description="A refund can be requested once the buyer's payment has settled into this order's escrow."
              />
            )
          }
        />

        <WithdrawalPreviewCard
          amount={amount}
          notes={reason}
          currencyCode={currency}
          amountLabel={t("refundAmount")}
          notesLabel={t("reasonForRefundPreview")}
          notesEmptyText={t("noReasonYet")}
          reviewTitle={t("refundReview")}
        />
      </div>

      <WithdrawalActions
        isLoading={isSubmitting}
        disabled={!hasEscrowFunds || !hasBakongAccount || hasActiveRequest}
        onCancel={handleCancel}
        submitText={t("submitRefundRequest")}
      />
    </form>
  );
}
