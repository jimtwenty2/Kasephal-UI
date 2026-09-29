// WithdrawalSection.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import AlertBox from "./AlertBox";
import WithdrawalFormCard from "./WithdrawalFormCard";
import WithdrawalPreviewCard from "./WithdrawalPreviewCard";
import WithdrawalActions from "./WithdrawalActions";
import { createRequestPaymentAction } from "@/action/requestPayment.action";
import { showApiError, showApiToast } from "@/lib/apiToast";
import {
  toRequestCurrency,
  validateRequestAmount,
} from "@/utils/requestPaymentAmount";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  missingOrderReference: {
    en: "Missing order reference. Cannot submit request.",
    kh: "បាត់ព័ត៌មានយោងការបញ្ជាទិញ។ មិនអាចដាក់ស្នើសំណើបានទេ។",
  },
  provideReason: {
    en: "Please provide a reason for this request.",
    kh: "សូមផ្តល់មូលហេតុសម្រាប់សំណើនេះ។",
  },
  unexpectedError: {
    en: "An unexpected error occurred. Please try again.",
    kh: "មានបញ្ហាមិនបានរំពឹងទុកកើតឡើង។ សូមព្យាយាមម្តងទៀត។",
  },
  requestSubmitted: {
    en: "Request submitted",
    kh: "បានដាក់សំណើ",
  },
  withdrawalSubmittedSuccess: {
    en: "Withdrawal request submitted successfully.",
    kh: "សំណើដកប្រាក់ត្រូវបានដាក់ដោយជោគជ័យ។",
  },
  requestFailed: {
    en: "Request failed",
    kh: "សំណើបានបរាជ័យ",
  },
  failedSubmitRequest: {
    en: "Failed to submit request. Please try again.",
    kh: "មិនអាចដាក់សំណើបានទេ។ សូមព្យាយាមម្តងទៀត។",
  },
  submitRequest: {
    en: "SUBMIT REQUEST",
    kh: "ដាក់ស្នើសំណើ",
  },
  cancel: {
    en: "Cancel",
    kh: "បោះបង់",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

type WithdrawalSectionProps = {
  orderId?: string;
  availableAmount: number;
  orderCurrencyCode: string;
  hasBakongAccount: boolean;
  hasActiveRequest: boolean;
};

export default function WithdrawalSection({
  orderId,
  availableAmount,
  orderCurrencyCode,
  hasBakongAccount,
  hasActiveRequest,
}: WithdrawalSectionProps) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getText(language as Language);

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const currency = toRequestCurrency(orderCurrencyCode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // A withdrawal can only be requested once the order's escrow is actually
  // funded — i.e. the buyer's payment has settled into escrow.
  const hasEscrowFunds = availableAmount > 0;

  const availableInSelected = availableAmount;

  const submittingRef = useRef(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (submittingRef.current) return;

    if (!orderId) {
      showApiError(new Error("Missing order reference. Cannot submit request."));
      return;
    }

    if (!hasEscrowFunds) {
      showApiError(
        new Error("No funds are held in escrow for this order yet."),
      );
      return;
    }

    if (!hasBakongAccount) {
      showApiError(
        new Error("Please add your Bakong ID in your profile before requesting a withdrawal."),
      );
      return;
    }

    if (hasActiveRequest) {
      showApiError(
        new Error("You already have an active withdrawal request for this order."),
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

    if (!notes.trim()) {
      showApiError(new Error(t("provideReason")));
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    let result;

    try {
      result = await createRequestPaymentAction({
        orderId,
        requestType: "WITHDRAW",
        amount: validation.amount,
        currencyCode: currency,
        reason: notes.trim(),
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
      successMessage: t("withdrawalSubmittedSuccess"),
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
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <WithdrawalFormCard
          amount={amount}
          setAmount={setAmount}
          notes={notes}
          setNotes={setNotes}
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
          alert={
            !hasBakongAccount ? (
              <AlertBox
                type="warning"
                title="Bakong ID required"
                description="Add your Bakong ID in your profile before requesting a withdrawal."
              />
            ) : hasActiveRequest ? (
              <AlertBox
                type="info"
                title="Withdrawal request in review"
                description="You can submit another withdrawal after the current request is completed or rejected, as long as escrow balance remains."
              />
            ) : !hasEscrowFunds ? (
              <AlertBox
                type="warning"
                title="No funds in escrow yet"
                description="A withdrawal can be requested once the buyer's payment has settled into this order's escrow."
              />
            ) : undefined
          }
        />

        <WithdrawalPreviewCard
          amount={amount}
          notes={notes}
          currencyCode={currency}
        />
      </div>

      <WithdrawalActions
        isLoading={isSubmitting}
        disabled={!hasEscrowFunds || !hasBakongAccount || hasActiveRequest}
        onCancel={handleCancel}
        submitText={t("submitRequest")}
        cancelText={t("cancel")}
      />
    </form>
  );
}
