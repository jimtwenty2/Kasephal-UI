"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

import {
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import {
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Landmark,
  PackageCheckIcon,
  Percent,
  StarIcon,
  Truck,
} from "lucide-react";

import type {
  DeliveryTracking,
  DeliveryTrackingStatus,
} from "@/services/delivery-tracking.service";
import type { Order } from "@/services/order.service";
import { getOrderCurrencyCode } from "@/utils/orderDisplay";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatCurrency";
import { confirmFarmerDeliveryAction } from "@/action/delivery-tracking.action";
import { getOrderPaymentProgressAction } from "@/action/order.action";
import { showApiError, showApiToast } from "@/lib/apiToast";
import RatingNoticeDialog from "./RatingNoticeDialog";
import { useI18n } from "@/lib/i18n/I18nContext";
import { createDeliveryTrackingSocket } from "@/lib/delivery-tracking-socket";

const TEXT = {
  order: { en: "Order", kh: "ការបញ្ជាទិញ" },
  rated: { en: "Rated", kh: "បានវាយតម្លៃ" },
  rating: { en: "Rating", kh: "វាយតម្លៃ" },

  financialSummary: { en: "Financial Summary", kh: "សង្ខេបហិរញ្ញវត្ថុ" },
  unitPrice: { en: "Unit Price", kh: "តម្លៃក្នុងមួយឯកតា" },
  quantity: { en: "Quantity", kh: "បរិមាណ" },
  totalAmount: { en: "Total Amount", kh: "ចំនួនសរុប" },
  depositPaid: { en: "Deposit Paid", kh: "ប្រាក់កក់បានបង់" },
  amountPaid: { en: "Amount Paid", kh: "ចំនួនបានបង់" },
  remainingBalance: { en: "Remaining Balance", kh: "ប្រាក់ដែលនៅសល់" },
  depositPercentage: { en: "Deposit Percentage", kh: "ភាគរយប្រាក់កក់" },
  ofTotalAmount: { en: "(of total amount)", kh: "(នៃចំនួនសរុប)" },
  paid: { en: "PAID", kh: "បានបង់" },
  pending: { en: "PENDING", kh: "កំពុងរង់ចាំ" },

  trackingDeliveryStatus: {
    en: "Tracking Delivery Status",
    kh: "តាមដានស្ថានភាពការដឹកជញ្ជូន",
  },
  pendingStep: { en: "Pending", kh: "កំពុងរង់ចាំ" },
  inTransitStep: { en: "In Transit", kh: "កំពុងដឹកជញ្ជូន" },
  confirmDeliveredStep: {
    en: "Confirmed",
    kh: "បញ្ជាក់ថាបានដឹកជញ្ជូន",
  },

  actionRequired: { en: "Action Required", kh: "ត្រូវការសកម្មភាព" },
  confirmReceiptMessage: {
    en: "Confirm receipt of your delivery to finalize the transaction.",
    kh: "សូមបញ្ជាក់ថាអ្នកបានទទួលការដឹកជញ្ជូន ដើម្បីបញ្ចប់ប្រតិបត្តិការ។",
  },
  confirmDelivery: {
    en: "Confirm Delivery",
    kh: "បញ្ជាក់ការដឹកជញ្ជូន",
  },
  confirming: { en: "Confirming...", kh: "កំពុងបញ្ជាក់..." },

  alreadyRatedTitle: { en: "Already Rated", kh: "បានវាយតម្លៃរួចហើយ" },
  alreadyRatedMessage: {
    en: "You have already rated this order.",
    kh: "អ្នកបានវាយតម្លៃការបញ្ជាទិញនេះរួចហើយ។",
  },
  orderNotCompleteTitle: {
    en: "Order Not Complete",
    kh: "ការបញ្ជាទិញមិនទាន់បញ្ចប់",
  },
  orderNotCompleteMessage: {
    en: "You can't rate this order yet. You can rate it once the buyer confirms delivery and the order is complete.",
    kh: "អ្នកមិនទាន់អាចវាយតម្លៃការបញ្ជាទិញនេះបានទេ។ អ្នកអាចវាយតម្លៃបាន នៅពេលអ្នកទិញបញ្ជាក់ការដឹកជញ្ជូន ហើយការបញ្ជាទិញបានបញ្ចប់។",
  },

  missingOrderReference: {
    en: "Missing order reference. Cannot confirm delivery.",
    kh: "បាត់ព័ត៌មានយោងការបញ្ជាទិញ។ មិនអាចបញ្ជាក់ការដឹកជញ្ជូនបានទេ។",
  },
  deliveryConfirmed: {
    en: "Delivery confirmed",
    kh: "បានបញ្ជាក់ការដឹកជញ្ជូន",
  },
  deliveryConfirmedSuccess: {
    en: "Delivery confirmed successfully.",
    kh: "ការដឹកជញ្ជូនត្រូវបានបញ្ជាក់ដោយជោគជ័យ។",
  },
  confirmationFailed: {
    en: "Confirmation failed",
    kh: "ការបញ្ជាក់បានបរាជ័យ",
  },
  confirmDeliveryFailed: {
    en: "Failed to confirm delivery.",
    kh: "បញ្ជាក់ការដឹកជញ្ជូនមិនបានសម្រេច។",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

const TRACKING_STEPS = [
  "PENDING",
  "IN_TRANSIT",
  "CONFIRMED",
] as const;

type TrackingStep = (typeof TRACKING_STEPS)[number];

const STATUS_TO_STEP: Record<DeliveryTrackingStatus, TrackingStep> = {
  PENDING: "PENDING",
  IN_TRANSIT: "IN_TRANSIT",
  CONFIRMED: "CONFIRMED",
};

const STEP_LABEL_KEY: Record<TrackingStep, TextKey> = {
  PENDING: "pendingStep",
  IN_TRANSIT: "inTransitStep",
  CONFIRMED: "confirmDeliveredStep",
};

type FarmerDeliveryTrackingPageProps = {
  tracking?: DeliveryTracking | null;
  order?: Order | null;
  alreadyRated?: boolean;
};

function StepIcon({
  step,
  className,
}: {
  step: TrackingStep;
  className?: string;
}) {
  if (step === "PENDING") return <Clock3 className={className} />;
  if (step === "IN_TRANSIT") return <Truck className={className} />;

  return <CheckCircle2 className={className} />;
}

function formatOrderCode(orderId?: string | null) {
  const suffix = orderId?.trim().slice(-4).toUpperCase() || "----";
  return `#ORD-${suffix}`;
}

type PaymentProgress = {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
};

export default function FarmerDeliveryTrackingPage({
  tracking,
  order,
  alreadyRated = false,
}: FarmerDeliveryTrackingPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { language } = useI18n();
  const t = getText(language as Language);
  const [currentTracking, setCurrentTracking] =
    useState<DeliveryTracking | null>(tracking ?? null);

  const [confirmed, setConfirmed] = useState(
    tracking?.isFarmerConfirmed ?? false,
  );
  const [isConfirming, startConfirming] = useTransition();
  const [ratingNoticeOpen, setRatingNoticeOpen] = useState(false);

  const baseStatus: DeliveryTrackingStatus = currentTracking?.status ?? "PENDING";

  const effectiveStatus: DeliveryTrackingStatus =
    confirmed && baseStatus === "PENDING" ? "IN_TRANSIT" : baseStatus;

  const currentStep = STATUS_TO_STEP[effectiveStatus];
  const currentStepIndex = TRACKING_STEPS.indexOf(currentStep);
  const deliveryStatus = t(STEP_LABEL_KEY[currentStep]);

  const canConfirmDeliveryStatus = effectiveStatus === "PENDING";

  const isBuyerConfirmed =
    currentTracking?.status === "CONFIRMED" || (order?.isCompleted ?? false);

  const canRate = !alreadyRated && isBuyerConfirmed;

  const ratingNotice = alreadyRated
    ? {
        title: t("alreadyRatedTitle"),
        message: t("alreadyRatedMessage"),
      }
    : {
        title: t("orderNotCompleteTitle"),
        message: t("orderNotCompleteMessage"),
      };

  const orderId = currentTracking?.orderId ?? tracking?.orderId ?? order?.orderId;

  const handleRatingClick = () => {
    if (!canRate) {
      setRatingNoticeOpen(true);
      return;
    }

    router.push(`/rating?orderId=${orderId}`);
  };

  const currencyCode = order ? getOrderCurrencyCode(order) : "USD";
  const isContractOrder = Boolean(order?.contractId);
  const initialTotalAmount = order?.totalAmount ?? 0;
  const initialRemainingAmount = Math.max(0, order?.remainingAmount ?? 0);
  const initialPaidAmount = Math.max(
    0,
    initialTotalAmount - initialRemainingAmount,
  );
  const [paymentProgress, setPaymentProgress] = useState<PaymentProgress>({
    totalAmount: initialTotalAmount,
    paidAmount: initialPaidAmount,
    remainingAmount: initialRemainingAmount,
    isFullyPaid:
      initialTotalAmount > 0 &&
      (initialRemainingAmount <= 0 ||
        ["PAID", "SUCCESS"].includes(
          String(order?.paymentStatus ?? order?.payment?.status ?? "").toUpperCase(),
        )),
  });

  const formatCurrency = (amount: number) =>
    formatCurrencyUtil(amount, currencyCode);

  const unitLabel = order?.unitType === "TONS" ? "Ton" : "KG";

  const depositPercentage =
    order && order.totalAmount > 0
      ? Math.round((order.depositAmount / order.totalAmount) * 100)
      : 0;

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function fetchPaymentProgress() {
      const progress = await getOrderPaymentProgressAction(orderId!);
      if (cancelled) return;

      setPaymentProgress((current) =>
        progress.totalAmount > 0 ? progress : current,
      );
    }

    void fetchPaymentProgress();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    const token = session?.user?.accessToken;
    if (!token || !orderId) return;

    const client = createDeliveryTrackingSocket({
      token,
      onTrackingUpdate: (event) => {
        const nextTracking = event.tracking;
        if (!nextTracking || nextTracking.orderId !== orderId) return;

        setCurrentTracking(nextTracking);
        setConfirmed(nextTracking.isFarmerConfirmed);
      },
    });

    if (!client) return;

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [orderId, session?.user?.accessToken]);

  const totalAmount =
    paymentProgress.totalAmount || order?.totalAmount || 0;
  const paidAmount = Math.max(
    paymentProgress.paidAmount,
    totalAmount - Math.max(paymentProgress.remainingAmount, 0),
  );
  const remainingAmount = Math.max(
    0,
    paymentProgress.remainingAmount ||
      (totalAmount > 0 ? totalAmount - paidAmount : order?.remainingAmount ?? 0),
  );
  const remainingPaid =
    paymentProgress.isFullyPaid || (totalAmount > 0 && remainingAmount <= 0);
  const canConfirmDelivery = canConfirmDeliveryStatus && remainingPaid;

  const handleConfirmDelivery = () => {
    if (!orderId) {
      showApiError(new Error(t("missingOrderReference")));
      return;
    }
    if (!remainingPaid) return;

    startConfirming(async () => {
      const result = await confirmFarmerDeliveryAction(orderId);

      const isSuccess = showApiToast(result, {
        successTitle: t("deliveryConfirmed"),
        successMessage: t("deliveryConfirmedSuccess"),
        errorTitle: t("confirmationFailed"),
        errorMessage: t("confirmDeliveryFailed"),
      });

      if (isSuccess) {
        setConfirmed(true);
        if (result.data) setCurrentTracking(result.data);
      }
    });
  };

  return (
    <div className="px-4 py-8 md:px-12">
      <div className="mx-auto w-full">
        <div className="rounded-3xl border border-none bg-white px-7 py-10">
          <div className="flex items-center justify-between border-b border-light-grey pb-6">
            <div className="flex items-center gap-4">
              <Link href={`/order-history/${orderId}`}>
                <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F7F7F7]">
                  <ArrowLeftIcon className="h-5 w-5 text-primary-heading" />
                </button>
              </Link>

              <h1 className="text-[24px] font-bold text-primary-heading">
                {t("order")} {formatOrderCode(orderId)}
              </h1>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {isBuyerConfirmed && (
                <button
                  type="button"
                  onClick={alreadyRated ? undefined : handleRatingClick}
                  disabled={alreadyRated}
                  className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl px-5 text-[13px] font-bold uppercase shadow-sm transition sm:w-auto ${
                    alreadyRated
                      ? "cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "cursor-pointer border border-amber-200 bg-[#FDBA3B] text-primary-heading hover:border-amber-500 hover:bg-amber-400 active:scale-[0.98]"
                  }`}
                >
                  {alreadyRated ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StarIcon className="h-5 w-5" />
                  )}
                  {alreadyRated ? t("rated") : t("rating")}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-light-grey bg-white p-6 shadow-2xs">
              <h3 className="mb-5 text-lg font-bold text-primary-heading">
                {t("financialSummary")}
              </h3>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex items-center justify-between text-secondary-body">
                  <span>{t("unitPrice")}</span>
                  <span className="font-semibold text-dark-grey">
                    {formatCurrency(order?.pricePerUnit ?? 0)}{" "}
                    <span className="text-xs text-muted">/ {unitLabel}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-secondary-body">
                  <span>{t("quantity")}</span>
                  <span className="font-semibold text-dark-grey">
                    x {order?.quantity ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                  <span className="text-base font-bold text-primary-heading">
                    {t("totalAmount")}
                  </span>
                  <span className="text-2xl font-extrabold text-primary">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="mt-4 space-y-1 pt-2">
                  <div className="flex items-center justify-between border-b border-gray-100 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
                        <BadgeDollarSign className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-secondary-body">
                        {isContractOrder ? t("depositPaid") : t("amountPaid")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-dark-grey">
                        {formatCurrency(isContractOrder ? order?.depositAmount ?? 0 : paidAmount)}
                      </span>
                      <span className="rounded-md bg-green-100/70 px-2 py-0.5 text-[9px] font-bold tracking-wider text-green-800">
                        {t("paid")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-gray-100 py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-secondary-body">
                        {t("remainingBalance")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-dark-grey">
                        {formatCurrency(remainingAmount)}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                          remainingPaid
                            ? "bg-green-100/70 text-green-800"
                            : "bg-amber-100/70 text-amber-800"
                        }`}
                      >
                        {remainingPaid ? t("paid") : t("pending")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                        <Percent className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-secondary-body">
                        {t("depositPercentage")}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block font-bold text-dark-grey">
                        {depositPercentage}%
                      </span>
                      <span className="-mt-0.5 block text-[10px] text-muted">
                        {t("ofTotalAmount")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[20px] border border-light-grey bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-[20px] font-bold text-primary-heading">
                    {t("trackingDeliveryStatus")}
                  </h2>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                    {deliveryStatus}
                  </span>
                </div>

                <div className="mt-6">
                  {TRACKING_STEPS.map((step, index) => {
                    const isReached =
                      currentStepIndex >= 0 && index <= currentStepIndex;
                    const isLast = index === TRACKING_STEPS.length - 1;
                    const isSegmentReached =
                      currentStepIndex >= 0 && index < currentStepIndex;

                    return (
                      <div
                        key={step}
                        className={`relative flex items-start gap-4 ${
                          isLast ? "" : "pb-6"
                        }`}
                      >
                        {!isLast && (
                          <div
                            className={`absolute bottom-0 left-[15px] top-8 w-[2px] ${
                              isSegmentReached ? "bg-primary" : "bg-light-grey"
                            }`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            isReached
                              ? "bg-primary text-white"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <StepIcon step={step} className="h-5 w-5" />
                        </div>

                        <div>
                          <h3 className="text-[16px] font-semibold text-primary-heading">
                            {t(STEP_LABEL_KEY[step])}
                          </h3>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {canConfirmDelivery && (
                <div className="rounded-[20px] border border-light-grey bg-white p-6 shadow-sm">
                  <h2 className="text-[20px] font-bold text-primary-heading">
                    {t("actionRequired")}
                  </h2>

                  <p className="mt-2 text-[15px] font-medium text-muted">
                    {t("confirmReceiptMessage")}
                  </p>

                  <button
                    type="button"
                    onClick={handleConfirmDelivery}
                    disabled={isConfirming}
                    className="mt-5 flex h-[48px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <PackageCheckIcon className="h-5 w-5" />
                    {isConfirming ? t("confirming") : t("confirmDelivery")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RatingNoticeDialog
        open={ratingNoticeOpen}
        title={ratingNotice.title}
        message={ratingNotice.message}
        onClose={() => setRatingNoticeOpen(false)}
      />
    </div>
  );
}
