"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { EscrowFlowStatus, EscrowPayment } from "../_types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  cancelPaymentAction,
  checkPaymentAction,
  createPaymentAction,
  getOrderPaymentsAction,
  getPaymentStatusAction,
} from "@/action/payment.action";
import { showApiError, showApiSuccess } from "@/lib/apiToast";
import { useI18n } from "@/lib/i18n/I18nContext";
import { sendChatMessageAction } from "@/app/chat/_actions/sendChatMessageAction";

import KhqrModal from "./KhqrModal";
import SuccessModal from "./SuccessModal";
import KpiCard from "./KpiCard";
import PaymentSummaryCard from "./PaymentSummaryCard";
import ContractBreakdownCard from "./ContractBreakdownCard";
import PaymentHistoryTable from "./PaymentHistoryTable";
import KhqrPaymentCard from "./KhqrPaymentCard";
import TransactionStepper from "./TransactionStepper";
import BreadcrumbNav from "@/components/navigation/BreadcrumbNav";

const TEXT = {
  home: { en: "Home", kh: "ទំព័រដើម" },
  chat: { en: "Chat", kh: "ការជជែក" },
  order: { en: "Order", kh: "ការបញ្ជាទិញ" },
  payment: { en: "Payment", kh: "ការទូទាត់" },

  paymentTitle: {
    en: "Contract Payment",
    kh: "ការទូទាត់",
  },
  escrowExecution: {
    en: "",
    kh: "និងការដំណើរការ Escrow",
  },
  secureFundContract: {
    en: "Pay the deposit for this accepted contract",
    kh: "ការបែងចែកប្រាក់ដោយសុវត្ថិភាពសម្រាប់កិច្ចសន្យា",
  },
  secureFundAllocation: {
    en: "Complete payment for this order",
    kh: "ការបែងចែកប្រាក់ដោយសុវត្ថិភាព",
  },

  contractAmount: {
    en: "Order Total",
    kh: "ចំនួនទឹកប្រាក់កិច្ចសន្យា",
  },
  depositRequired: {
    en: "Deposit to Pay",
    kh: "ប្រាក់កក់ដែលត្រូវបង់",
  },
  escrowStatus: {
    en: "Payment Status",
    kh: "ស្ថានភាព Escrow",
  },
  remainingBalance: {
    en: "Pay Later",
    kh: "ប្រាក់ដែលនៅសល់",
  },

  failed: {
    en: "Failed",
    kh: "បរាជ័យ",
  },
  depositHeld: {
    en: "Paid",
    kh: "ប្រាក់កក់ត្រូវបានរក្សាទុក",
  },
  failedUpper: {
    en: "FAILED",
    kh: "បរាជ័យ",
  },
  paidUpper: {
    en: "PAID",
    kh: "បានបង់",
  },
  pendingUpper: {
    en: "PENDING",
    kh: "កំពុងរង់ចាំ",
  },

  checkoutKhqr: {
    en: "Pay with KHQR",
    kh: "ទូទាត់ប្រាក់ និង KHQR",
  },
  goToOrderHistory: {
    en: "Go to Order History",
    kh: "ទៅកាន់ប្រវត្តិការបញ្ជាទិញ",
  },

  paymentSuccessful: {
    en: "Payment successful",
    kh: "ការទូទាត់បានជោគជ័យ",
  },
  depositSecured: {
    en: "Your payment has been received.",
    kh: "ប្រាក់កក់របស់អ្នកត្រូវបានរក្សាទុកក្នុង Escrow ដោយសុវត្ថិភាព។",
  },
  missingOrderReference: {
    en: "Missing order reference for this payment.",
    kh: "បាត់ព័ត៌មានយោងការបញ្ជាទិញសម្រាប់ការទូទាត់នេះ។",
  },
  failedGeneratePayment: {
    en: "Failed to generate payment.",
    kh: "មិនអាចបង្កើតការទូទាត់បានទេ។",
  },
  failedCheckPaymentStatus: {
    en: "Failed to check payment status.",
    kh: "មិនអាចពិនិត្យស្ថានភាពការទូទាត់បានទេ។",
  },
} as const;

type Language = keyof (typeof TEXT)[keyof typeof TEXT];
type TextKey = keyof typeof TEXT;

function getText(language: Language) {
  return (key: TextKey) => TEXT[key][language] ?? TEXT[key].en;
}

interface PaymentEscrowClientProps {
  payment: EscrowPayment;
}

const POLL_INTERVAL_MS = 10000;
const QR_TOTAL_SECONDS = 300;

function isPaidStatus(value: unknown) {
  const status = String(value ?? "").toUpperCase();
  return status === "PAID" || status === "SUCCESS";
}

function roundPaymentAmount(amount: number, currencyCode: "USD" | "KHR") {
  return currencyCode === "KHR" ? Math.round(amount) : Number(amount.toFixed(2));
}

function sumPaidAmount(paymentHistory: NonNullable<EscrowPayment["paymentHistory"]>) {
  return paymentHistory
    .filter((paymentItem) => isPaidStatus(paymentItem.status))
    .reduce((sum, paymentItem) => sum + Number(paymentItem.amount ?? 0), 0);
}

function isBuyerPayment(
  paymentItem: { status?: unknown; paidBy?: string | null },
  buyerId?: string | null,
) {
  if (!isPaidStatus(paymentItem.status)) return false;
  if (!paymentItem.paidBy || !buyerId) return true;
  return paymentItem.paidBy === buyerId;
}

function buildPaymentCompletedMessage({
  orderId,
  crop,
  qty,
  amount,
  buyer,
}: {
  orderId: string;
  crop: string;
  qty: string;
  amount: string;
  buyer: string;
}) {
  return [
    `PAYMENT_COMPLETED:${orderId}`,
    `crop:${crop.replace(/\s+/g, " ").trim() || "Crop"}`,
    `qty:${qty.replace(/\s+/g, " ").trim()}`,
    `amount:${amount}`,
    `buyer:${buyer.replace(/\s+/g, " ").trim() || "Buyer"}`,
  ].join("\n");
}

export default function PaymentEscrowClient({
  payment,
}: PaymentEscrowClientProps) {
  const router = useRouter();
  const { language } = useI18n();
  const t = getText(language as Language);

  const hasContract = !!payment.contractId;
  const currencyCode = payment.currencyCode;
  const money = useCallback(
    (value: number) => formatCurrency(value, currencyCode),
    [currencyCode],
  );

  const initialPaymentHistory = payment.paymentHistory ?? [];
  const initialPaidAmount = sumPaidAmount(initialPaymentHistory);
  const initialRemainingBalance = Math.max(
    0,
    payment.contractAmount - initialPaidAmount,
  );
  const approvedPaymentAmount =
    payment.approvedPaymentAmount && payment.approvedPaymentAmount > 0
      ? roundPaymentAmount(payment.approvedPaymentAmount, currencyCode)
      : 0;
  const isFirstContractPayment = hasContract && initialPaidAmount <= 0;
  const lockedInitialAmount = isFirstContractPayment
    ? Math.min(payment.depositAmount, initialRemainingBalance)
    : approvedPaymentAmount > 0
      ? Math.min(approvedPaymentAmount, initialRemainingBalance)
      : 0;

  const [flowStatus, setFlowStatus] = useState<EscrowFlowStatus>("IDLE");
  const [qr, setQr] = useState<{
    qrString: string;
    paymentId: string;
    md5: string;
    amount: number;
  } | null>(null);
  const [countdown, setCountdown] = useState(QR_TOTAL_SECONDS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState(initialPaymentHistory);
  const [paidAmount, setPaidAmount] = useState(initialPaidAmount);
  const [paymentAmount, setPaymentAmount] = useState(() =>
    roundPaymentAmount(
      lockedInitialAmount > 0
        ? lockedInitialAmount
        : Math.min(payment.depositAmount, initialRemainingBalance),
      currencyCode,
    ),
  );
  const [isPaid, setIsPaid] = useState(initialRemainingBalance <= 0);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const settledRef = useRef(false);
  const activePaymentIdRef = useRef<string | null>(null);

  const formattedTime = `${Math.floor(countdown / 60)}:${String(
    countdown % 60,
  ).padStart(2, "0")}`;

  const isExpired = flowStatus === "QR_EXPIRED";
  const remainingBalance = Math.max(0, payment.contractAmount - paidAmount);
  const needsApprovedRemainingPayment =
    hasContract &&
    paidAmount > 0 &&
    payment.approvedPaymentAmount == null &&
    remainingBalance > 0;
  const isDepositPayment = hasContract && paidAmount <= 0;
  const isApprovedRemainingPayment = hasContract && paidAmount > 0 && approvedPaymentAmount > 0;
  const currentPaymentLabel = isDepositPayment
    ? "Contract Deposit"
    : isApprovedRemainingPayment
      ? "Approved Remaining Payment"
      : "Current Payment";
  const remainingAfterLabel = isDepositPayment
    ? "Remaining After Deposit"
    : "Remaining After This Payment";
  const lockedPaymentAmount =
    paidAmount <= 0
      ? Math.min(payment.depositAmount, remainingBalance)
      : approvedPaymentAmount > 0
        ? Math.min(approvedPaymentAmount, remainingBalance)
        : 0;
  const effectivePaymentAmount =
    needsApprovedRemainingPayment
      ? 0
      : lockedPaymentAmount > 0
        ? lockedPaymentAmount
        : paymentAmount;
  const amountToPay = roundPaymentAmount(
    Math.min(Math.max(effectivePaymentAmount, 0), remainingBalance),
    currencyCode,
  );
  const remainingAfterPayment = Math.max(0, remainingBalance - amountToPay);
  const isPaymentComplete = isPaid || remainingBalance <= 0;

  const clearTimers = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const markSuccess = useCallback((settledPayment: { paymentId: string; amount: number }) => {
    if (settledRef.current) return;
    if (
      activePaymentIdRef.current &&
      settledPayment.paymentId !== activePaymentIdRef.current
    ) {
      return;
    }

    settledRef.current = true;

    clearTimers();
    setIsModalOpen(false);
    setShowSuccessModal(true);

    showApiSuccess(t("paymentSuccessful"), t("depositSecured"));

    void (async () => {
      let latestHistory = paymentHistory;
      if (payment.orderId) {
        const latestPayments = await getOrderPaymentsAction(payment.orderId);
        const latestBuyerPayments = latestPayments.filter((item) =>
          isBuyerPayment(item, payment.buyerId),
        );
        if (latestBuyerPayments.length > 0) {
          latestHistory = latestBuyerPayments.map((item) => ({
            paymentId: item.paymentId,
            amount: item.amount,
            status: item.status,
            method: "KHQR",
            paidAt: item.paidAt ?? "",
          }));
          setPaymentHistory(latestHistory);
        }
      }

      const latestPaidAmount = sumPaidAmount(latestHistory);
      const optimisticPaidAmount = Math.min(
        payment.contractAmount,
        paidAmount + settledPayment.amount,
      );
      const nextPaidAmount = Math.max(latestPaidAmount, optimisticPaidAmount);
      const nextRemaining = Math.max(0, payment.contractAmount - nextPaidAmount);

      setPaidAmount(nextPaidAmount);
      setIsPaid(nextRemaining <= 0);
      setPaymentAmount(roundPaymentAmount(nextRemaining, currencyCode));
      activePaymentIdRef.current = null;
      setQr(null);
      setFlowStatus(nextRemaining <= 0 ? "PAYMENT_SUCCESS" : "IDLE");

      const noticeKey = settledPayment.paymentId
        ? `payment_completed_notice_sent:${settledPayment.paymentId}`
        : "";
      const alreadySent =
        Boolean(noticeKey) && sessionStorage.getItem(noticeKey) === "true";

      if (
        payment.chatRoomId &&
        payment.orderId &&
        !alreadySent
      ) {
        sessionStorage.setItem(noticeKey, "true");
        await sendChatMessageAction({
          chatRoomId: payment.chatRoomId,
          content: buildPaymentCompletedMessage({
            orderId: payment.orderId,
            crop: payment.productName,
            qty: payment.qty ?? "",
            amount: money(settledPayment.amount),
            buyer: payment.buyerName,
          }),
        });
      }

      window.setTimeout(() => {
        if (payment.chatRoomId) {
          router.push(`/chat?chatRoomId=${encodeURIComponent(payment.chatRoomId)}`);
          return;
        }

        router.push("/order-history");
      }, 900);
    })();
  }, [clearTimers, currencyCode, money, paidAmount, payment.buyerId, payment.buyerName, payment.chatRoomId, payment.contractAmount, payment.orderId, payment.productName, payment.qty, paymentHistory, router, t]);

  const generatePayment = useCallback(async () => {
    if (!payment.orderId) {
      showApiError(new Error(t("missingOrderReference")));
      return;
    }

    setFlowStatus("IDLE");
    activePaymentIdRef.current = null;
    settledRef.current = false;

    if (needsApprovedRemainingPayment) {
      showApiError(new Error("Create a remaining payment request from chat first."));
      return;
    }

    if (amountToPay <= 0) {
      showApiError(new Error("Enter an amount greater than 0."));
      return;
    }

    let result = await createPaymentAction({
      orderId: payment.orderId,
      amountToPay,
      currencyCode,
    });

    if (
      result.success &&
      result.data &&
      String(result.data.status).toUpperCase() === "PENDING" &&
      Math.abs(Number(result.data.amount) - amountToPay) >
        (currencyCode === "KHR" ? 1 : 0.01)
    ) {
      await cancelPaymentAction(result.data.paymentId);
      result = await createPaymentAction({
        orderId: payment.orderId,
        amountToPay,
        currencyCode,
      });
    }

    if (!result.success || !result.data) {
      showApiError(new Error(result.error ?? t("failedGeneratePayment")));
      setFlowStatus("QR_EXPIRED");
      return;
    }

    activePaymentIdRef.current = result.data.paymentId;

    setQr({
      qrString: result.data.qrString,
      paymentId: result.data.paymentId,
      md5: result.data.md5,
      amount: result.data.amount,
    });
    setCountdown(QR_TOTAL_SECONDS);
    setFlowStatus("KHQR_READY");
    setIsModalOpen(true);
  }, [amountToPay, currencyCode, needsApprovedRemainingPayment, payment.orderId, t]);

  const verifyPayment = useCallback(
    async (paymentQr: { paymentId: string; md5: string; amount: number }) => {
      if (settledRef.current) return;
      if (!paymentQr.paymentId) return;

      if (paymentQr.md5) {
        const md5Result = await checkPaymentAction(paymentQr.md5);

        if (md5Result.success && md5Result.settled) {
          markSuccess({ paymentId: paymentQr.paymentId, amount: paymentQr.amount });
          return;
        }
      }

      const res = await getPaymentStatusAction(paymentQr.paymentId);

      if (res.success && res.settled) {
        markSuccess({ paymentId: paymentQr.paymentId, amount: paymentQr.amount });
        return;
      }

      if (payment.orderId) {
        const orderPayments = await getOrderPaymentsAction(payment.orderId);
        const currentPayment = orderPayments.find(
          (orderPayment) => orderPayment.paymentId === paymentQr.paymentId,
        );
        const currentPaymentIsPaid = ["PAID", "SUCCESS"].includes(
          String(currentPayment?.status).toUpperCase(),
        );

        if (currentPaymentIsPaid) {
          markSuccess({ paymentId: paymentQr.paymentId, amount: paymentQr.amount });
          return;
        }
      }

      if (!res.success) {
        showApiError(new Error(res.error ?? t("failedCheckPaymentStatus")));
      }
    },
    [markSuccess, payment.orderId, t],
  );

  useEffect(() => {
    if (flowStatus !== "KHQR_READY" || !qr) return;

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearTimers();
          setFlowStatus("QR_EXPIRED");
          setIsModalOpen(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    void verifyPayment(qr);
    pollRef.current = setInterval(() => void verifyPayment(qr), POLL_INTERVAL_MS);

    return () => clearTimers();
  }, [flowStatus, qr, verifyPayment, clearTimers]);

  const handlePaymentNow = () => {
    if (isPaymentComplete) return;

    if (isExpired || !qr) {
      void generatePayment();
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <div className="mt-6 min-w-full px-6 font-thicccboi">
      <div className="relative z-0 -mt-[100px] h-18.25 w-full overflow-hidden rounded-[28px]">
        <Image
          src="/assets/nav-bar/navbar_bg_image.png"
          alt="Hero Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <main className="relative min-h-screen bg-[#F9F6EE] px-4 py-6 font-thicccboi text-primary-heading md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <BreadcrumbNav
            items={[
              { label: t("home"), href: "/" },
              {
                label: t("chat"),
                href: payment.chatRoomId
                  ? `/chat?chatRoomId=${encodeURIComponent(payment.chatRoomId)}`
                  : "/chat",
              },
              { label: t("order"), href: "/order-history" },
              { label: t("payment") },
            ]}
            className="mx-0 mb-6 max-w-none py-0 text-slate-400"
            currentClassName="text-[#107446]"
          />

          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[#222222] md:text-4xl">
              {t("paymentTitle")}
            </h1>

            <p className="mt-2 text-sm text-description-text">
              {hasContract
                ? isDepositPayment
                  ? "First pay the contract deposit. Later remaining payments must be requested from chat and approved by the farmer."
                  : isApprovedRemainingPayment
                    ? "Pay the remaining amount approved by the farmer."
                    : "Create a remaining payment request from chat and wait for farmer approval before paying."
                : t("secureFundAllocation")}
            </p>
          </div>

          {hasContract && (
            <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label={t("contractAmount")}
                value={money(payment.contractAmount)}
              />

              <KpiCard
                label={currentPaymentLabel}
                value={money(amountToPay)}
              />

              <KpiCard
                label={t("escrowStatus")}
                value={
                  isExpired
                    ? t("failed")
                    : isPaymentComplete
                      ? t("depositHeld")
                      : payment.escrowStatus
                }
              />

              <KpiCard
                label={remainingAfterLabel}
                value={money(remainingAfterPayment)}
              />
            </section>
          )}

          <section className="rounded-[28px] bg-white p-5 shadow-sm md:p-7">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#222222]">
                {t("checkoutKhqr")}
              </h2>

              <span
                className={`rounded-full px-4 py-1.5 text-xs font-bold ${
                  isExpired
                    ? "bg-red-100 text-red-600"
                    : isPaymentComplete
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-600"
                }`}
              >
                {isExpired
                  ? t("failedUpper")
                  : isPaymentComplete
                    ? t("paidUpper")
                    : t("pendingUpper")}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.85fr_1fr]">
              <div className="space-y-6">
                <PaymentSummaryCard payment={payment} />

                <ContractBreakdownCard
                  isDirectPayment={!hasContract}
                  depositAmount={amountToPay}
                  remainingBalance={remainingAfterPayment}
                  totalAmount={payment.contractAmount}
                  depositPercent={payment.depositPercent}
                  currencyCode={currencyCode}
                  qty={payment.qty || "—"}
                  productName={payment.productName}
                  paymentLabel={currentPaymentLabel}
                  remainingLabel={remainingAfterLabel}
                />

                {paymentHistory.length > 0 && (
                  <PaymentHistoryTable
                    paymentHistory={paymentHistory}
                    isRemainingPaid={isPaymentComplete}
                    flowStatus={flowStatus}
                    isDirectPayment={!hasContract}
                  />
                )}
              </div>

              <div className="space-y-6">
                <KhqrPaymentCard
                  depositAmount={amountToPay}
                  remainingBalance={remainingAfterPayment}
                  paymentAmount={amountToPay}
                  maxPaymentAmount={remainingBalance}
                  currencyCode={currencyCode}
                  formattedTime={formattedTime}
                  flowStatus={flowStatus}
                  isRemainingPaid={isPaymentComplete}
                  isDirectPayment={!hasContract}
                  isAmountLocked={hasContract}
                  actionDisabled={needsApprovedRemainingPayment}
                  actionDisabledText="Request from chat"
                  paymentPurpose={
                    isDepositPayment
                      ? "deposit"
                      : isApprovedRemainingPayment
                        ? "remaining"
                        : "direct"
                  }
                  onPaymentNow={handlePaymentNow}
                  onRetry={() => void generatePayment()}
                  onPaymentAmountChange={(amount) => {
                    setPaymentAmount(
                      roundPaymentAmount(
                        Math.min(Math.max(amount, 0), remainingBalance),
                        currencyCode,
                      ),
                    );
                  }}
                />

                <TransactionStepper
                  flowStatus={flowStatus}
                  isRemainingPaid={isPaymentComplete}
                />

                <Link
                  href="/order-history"
                  className="block w-full rounded-full bg-amber-400 px-5 py-3 text-center font-bold text-white transition-colors hover:bg-amber-500"
                >
                  {t("goToOrderHistory")}
                </Link>
              </div>
            </div>
          </section>
        </div>

        <KhqrModal
          isOpen={isModalOpen}
          amount={amountToPay}
          currencyCode={currencyCode}
          qrPayload={qr?.qrString ?? ""}
          expiresIn={formattedTime}
          isExpired={isExpired}
          onClose={() => setIsModalOpen(false)}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          type="PAYMENT"
          onClose={() => setShowSuccessModal(false)}
        />
      </main>
    </div>
  );
}
