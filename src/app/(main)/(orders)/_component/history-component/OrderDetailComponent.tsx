"use client";

import { useEffect, useState, useTransition, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  Mail,
  BadgeDollarSign,
  RotateCcw,
  CheckCircle2,
  Lock,
  MessageCircle,
  CreditCard,
  ReceiptText,
  Loader2,
  Send,
  Star,
} from "lucide-react";
import {
  TruckIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

import { Order } from "@/services/order.service";
import type { DeliveryTracking } from "@/services/delivery-tracking.service";
import type { OrderReview } from "@/services/review.service";
import type { UserProfile } from "@/services/profile.service";
import { UserRole } from "@/types/user-role";
import { formatCambodiaPhone } from "@/utils/formatCambodiaPhone";
import { formatCurrency as formatCurrencyUtil } from "@/utils/formatCurrency";
import {
  getOrderCropName,
  getOrderCurrencyCode,
} from "@/utils/orderDisplay";
import {
  getOrderChatMessageTextsAction,
} from "@/action/order.action";
import { useI18n } from "@/lib/i18n/I18nContext";
import { sendChatMessageAction } from "@/app/chat/_actions/sendChatMessageAction";

type Lang = "en" | "kh";

type OrderPayment = {
  paymentId: string;
  amount: number;
  status: string;
  method?: string;
  paidAt?: string | null;
  paidBy?: string | null;
  paymentRequestId?: string | null;
  requestType?: "WITHDRAW" | "REFUND" | string | null;
  requestedBy?: string | null;
  requesterId?: string | null;
  requesterName?: string | null;
  releasedTo?: string | null;
  releasedToId?: string | null;
  releasedToName?: string | null;
  recipientId?: string | null;
  recipientName?: string | null;
  paidTo?: string | null;
  paidToId?: string | null;
  paidToName?: string | null;
  userName?: string | null;
  fullName?: string | null;
};

// ✅ Translation map
const TEXT = {
  home: { en: "Home", kh: "ទំព័រដើម" },
  orderHistory: { en: "Order History", kh: "ប្រវត្តិការបញ្ជាទិញ" },
  orderDetail: { en: "Order Detail", kh: "ព័ត៌មានលម្អិតការបញ្ជាទិញ" },
  orderNumber: { en: "Order #", kh: "លេខការបញ្ជាទិញ #" },
  delivery: { en: "DELIVERY", kh: "ការដឹកជញ្ជូន" },
  reportIssue: { en: "Report Issue", kh: "រាយការណ៍បញ្ហា" },
  viewReport: { en: "View Report", kh: "មើលរបាយការណ៍" },
  noDescription: {
    en: "No description provided for this product.",
    kh: "មិនមានការពិពណ៌នាសម្រាប់ផលិតផលនេះទេ។",
  },
  pricePerTon: { en: "Price / Ton", kh: "តម្លៃ / តោន" },
  pricePerKg: { en: "Price / KG", kh: "តម្លៃ / គីឡូក្រាម" },
  quantity: { en: "Quantity", kh: "បរិមាណ" },
  financialSummary: { en: "Financial Summary", kh: "សង្ខេបហិរញ្ញវត្ថុ" },
  paymentHistory: { en: "Payment History", kh: "ប្រវត្តិការទូទាត់" },
  paidPaymentsOnly: {
    en: "Completed payments recorded for this order.",
    kh: "ការទូទាត់ដែលបានបញ្ចប់សម្រាប់ការបញ្ជាទិញនេះ",
  },
  escrowPayoutHistory: {
    en: "Escrow Payout History",
    kh: "ប្រវត្តិបញ្ចេញប្រាក់ Escrow",
  },
  escrowPayoutsOnly: {
    en: "Withdraw and refund payouts released from this order's escrow.",
    kh: "ការដកប្រាក់ និងការសងប្រាក់វិញដែលបានបញ្ចេញពី Escrow នៃការបញ្ជាទិញនេះ",
  },
  releasedAt: { en: "Released At", kh: "បានបញ្ចេញនៅ" },
  releasedTo: { en: "Released To", kh: "បានបញ្ចេញទៅ" },
  noPaidPayments: {
    en: "No paid payment has been recorded yet.",
    kh: "មិនទាន់មានការទូទាត់ដែលបានកត់ត្រាទេ",
  },
  paymentId: { en: "Payment ID", kh: "លេខសម្គាល់ការទូទាត់" },
  amount: { en: "Amount", kh: "ចំនួនទឹកប្រាក់" },
  method: { en: "Method", kh: "វិធីសាស្ត្រ" },
  paidAt: { en: "Paid At", kh: "បានបង់នៅ" },
  unitPrice: { en: "Unit Price", kh: "តម្លៃក្នុងមួយឯកតា" },
  totalAmount: { en: "Total Amount", kh: "ចំនួនសរុប" },
  totalPaid: { en: "Total Paid", kh: "បានបង់សរុប" },
  depositPaid: { en: "Deposit Paid", kh: "ប្រាក់កក់បានបង់" },
  remainingBalance: { en: "Remaining Balance", kh: "ប្រាក់ដែលនៅសល់" },
  depositPercentage: { en: "Deposit Percentage", kh: "ភាគរយប្រាក់កក់" },
  ofTotalAmount: { en: "(of total amount)", kh: "(នៃចំនួនសរុប)" },
  contactInformation: { en: "Contact Information", kh: "ព័ត៌មានទំនាក់ទំនង" },
  supplierFarmer: { en: "Supplier", kh: "អ្នកផ្គត់ផ្គង់" },
  farmerBadge: { en: "Farmer", kh: "កសិករ" },
  buyerLabel: { en: "Buyer", kh: "អ្នកទិញ" },
  buyerBadge: { en: "Buyer", kh: "អ្នកទិញ" },
  orderStatus: { en: "Order Status", kh: "ស្ថានភាពការបញ្ជាទិញ" },
  accepted: { en: "Accepted", kh: "បានទទួលយក" },
  rejected: { en: "Rejected", kh: "បានបដិសេធ" },
  awaitingDecision: {
    en: "Awaiting Farmer Decision",
    kh: "កំពុងរង់ចាំការសម្រេចចិត្តរបស់កសិករ",
  },
  reviewOrderPrompt: {
    en: "Review the order and accept or reject the buyer's request.",
    kh: "សូមពិនិត្យការបញ្ជាទិញ និងទទួលយក ឬបដិសេធការស្នើសុំរបស់អ្នកទិញ។",
  },
  accepting: { en: "Accepting…", kh: "កំពុងទទួលយក..." },
  acceptOrder: { en: "Accept Order", kh: "ទទួលយកការបញ្ជាទិញ" },
  rejecting: { en: "Rejecting…", kh: "កំពុងបដិសេធ..." },
  rejectOrder: { en: "Reject Order", kh: "បដិសេធការបញ្ជាទិញ" },
  goToChat: { en: "Go to Chat", kh: "ទៅកាន់ការជជែក" },
  rating: { en: "Rating", kh: "វាយតម្លៃ" },
  rated: { en: "Rated", kh: "បានវាយតម្លៃ" },
  ratingSummary: { en: "Rating Summary", kh: "សង្ខេបការវាយតម្លៃ" },
  ratedByBuyer: { en: "Rated by Buyer", kh: "បានវាយតម្លៃដោយអ្នកទិញ" },
  ratedByFarmer: { en: "Rated by Farmer", kh: "បានវាយតម្លៃដោយកសិករ" },
  noCounterpartyRating: {
    en: "The other party has not rated this order yet.",
    kh: "ភាគីម្ខាងទៀតមិនទាន់បានវាយតម្លៃការបញ្ជាទិញនេះទេ។",
  },
  yourRatingSubmitted: {
    en: "Your review for this order has been submitted.",
    kh: "ការវាយតម្លៃរបស់អ្នកសម្រាប់ការបញ្ជាទិញនេះត្រូវបានដាក់បញ្ជូនរួចហើយ។",
  },
  payNow: { en: "Pay Now", kh: "បង់ប្រាក់ឥឡូវ" },
  updateOrder: { en: "Update Order", kh: "កែប្រែការបញ្ជាទិញ" },
  requestWithdraw: { en: "Request Withdraw", kh: "ស្នើសុំដកប្រាក់" },
  requestRefund: { en: "Request Refund", kh: "ស្នើសុំសងប្រាក់វិញ" },
  requestReceived: {
    en: "We've received your request. The admin team is reviewing it.",
    kh: "យើងបានទទួលការស្នើសុំរបស់អ្នក។ ក្រុមអ្នកគ្រប់គ្រងកំពុងពិនិត្យ។",
  },
  withdrawSubmitted: {
    en: "Your withdraw request has been submitted",
    kh: "ការស្នើសុំដកប្រាក់របស់អ្នកត្រូវបានដាក់បញ្ជូន",
  },
  refundSubmitted: {
    en: "Your refund request has been submitted",
    kh: "ការស្នើសុំសងប្រាក់វិញរបស់អ្នកត្រូវបានដាក់បញ្ជូន",
  },
  manageEscrow: {
    en: "Manage your digital escrow order options.",
    kh: "គ្រប់គ្រងជម្រើសការបញ្ជាទិញអេស្ក្រូឌីជីថលរបស់អ្នក។",
  },
  escrowSettledWithdraw: {
    en: "This order's escrow has been settled. No withdraw is available.",
    kh: "អេស្ក្រូនៃការបញ្ជាទិញនេះត្រូវបានដោះស្រាយហើយ។ មិនមានការដកប្រាក់ទេ។",
  },
  escrowSettledRefund: {
    en: "This order's escrow has been settled. No refund is available.",
    kh: "អេស្ក្រូនៃការបញ្ជាទិញនេះត្រូវបានដោះស្រាយហើយ។ មិនមានការសងប្រាក់វិញទេ។",
  },
  escrowPendingWithdraw: {
    en: "You can request for withdraw once the buyer has paid the order.",
    kh: "អ្នកអាចស្នើសុំដកប្រាក់បន្ទាប់ពីអ្នកទិញបង់ប្រាក់ការបញ្ជាទិញ។",
  },
  escrowPendingRefund: {
    en: "You can request for refund once you have paid the order.",
    kh: "អ្នកអាចស្នើសុំសងប្រាក់វិញបន្ទាប់ពីអ្នកបង់ប្រាក់ការបញ្ជាទិញ។",
  },
  farmerProfileAlt: { en: "Farmer Profile", kh: "រូបភាពកសិករ" },
  buyerProfileAlt: { en: "Buyer Profile", kh: "រូបភាពអ្នកទិញ" },
} as const;

const t = (key: keyof typeof TEXT, lang: Lang): string => TEXT[key][lang];

function formatOrderCode(orderId?: string | null) {
  const suffix = orderId?.trim().slice(-4).toUpperCase() || "----";
  return `#ORD-${suffix}`;
}

function formatPaymentCode(paymentId?: string | null) {
  const suffix = paymentId?.trim().slice(-4).toUpperCase() || "----";
  return `#PAY-${suffix}`;
}

// ─── constants ────────────────────────────────────────────────────────────────

interface OrderDetailPageProps {
  order: Order;
  role: UserRole;
  farmerProfile?: UserProfile | null;
  buyerProfile?: UserProfile | null;
  alreadyRequested?: boolean;
  deliveryTracking?: DeliveryTracking | null;
  reviews?: OrderReview[];
  currentUserId?: string | null;
  activeReportId?: string | null;
}

const PROFILE_FALLBACK_IMAGE = "/assets/nav-bar/profile.png";
const CROP_FALLBACK_IMAGE = "/assets/image/no-product.jpg";

function CropImage({
  src,
  alt,
  fallback,
}: {
  src: string;
  alt: string;
  fallback: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority
      className="object-cover"
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback);
      }}
    />
  );
}

function SummaryTile({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-2 text-lg font-extrabold ${
          highlight ? "text-primary" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function PaymentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
      <span>{label}</span>
      <span className="font-bold text-primary-heading">{value}</span>
    </div>
  );
}

function buildPaymentRequestMessage({
  order,
  cropName,
  amount,
  currency,
  paidBefore,
}: {
  order: Order;
  cropName: string;
  amount: number;
  currency: "USD" | "KHR";
  paidBefore: number;
}) {
  const requestId = `${order.orderId}-${Date.now()}`;

  return [
    `PAYMENT_REQUEST:${requestId}`,
    `orderId:${order.orderId}`,
    `crop:${cropName}`,
    `qty:${order.quantity} ${order.unitType || "KG"}`,
    `amount:${amount}`,
    `paidBefore:${paidBefore}`,
    `buyer:${order.buyerName ?? "Buyer"}`,
    `currency:${currency}`,
    `chatRoomId:${order.chatRoomId ?? ""}`,
  ].join("\n");
}

function hasUnresolvedPaymentRequest(messageTexts: string[], orderId: string) {
  const resolvedRequestIds = new Set<string>();
  const pendingRequestIds = new Set<string>();

  for (const text of messageTexts) {
    const acceptedRequestId = parsePaymentRequestDecisionId(
      text,
      "PAYMENT_REQUEST_ACCEPTED:",
    );
    const rejectedRequestId = parsePaymentRequestDecisionId(
      text,
      "PAYMENT_REQUEST_REJECTED:",
    );
    const decisionRequestId = acceptedRequestId || rejectedRequestId;

    if (decisionRequestId) {
      resolvedRequestIds.add(decisionRequestId);
      pendingRequestIds.delete(decisionRequestId);
      continue;
    }

    const request = parsePaymentRequest(text);
    if (request?.orderId === orderId && !resolvedRequestIds.has(request.requestId)) {
      pendingRequestIds.add(request.requestId);
    }
  }

  return pendingRequestIds.size > 0;
}

function parsePaymentRequest(text: string) {
  const lines = text.split("\n").map((line) => line.trim());
  const firstLine = lines[0] ?? "";
  if (!firstLine.startsWith("PAYMENT_REQUEST:")) return null;

  const requestId = firstLine.replace("PAYMENT_REQUEST:", "").trim();
  if (!requestId) return null;

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  return {
    requestId,
    orderId: fields.orderId ?? "",
  };
}

function parsePaymentRequestDecisionId(text: string, prefix: string) {
  const firstLine = text.split("\n")[0]?.trim() ?? "";
  if (!firstLine.startsWith(prefix)) return "";

  return firstLine.replace(prefix, "").trim();
}

function isPaidPaymentStatus(status: unknown) {
  const normalizedStatus = String(status ?? "").toUpperCase();
  return normalizedStatus === "PAID" || normalizedStatus === "SUCCESS";
}

function getPaymentRequestType(payment: OrderPayment) {
  return String(payment.requestType ?? "").toUpperCase();
}

function isRequestPayoutPayment(payment: OrderPayment) {
  const requestType = getPaymentRequestType(payment);
  return Boolean(
    payment.paymentRequestId ||
      requestType === "WITHDRAW" ||
      requestType === "REFUND",
  );
}

function isBuyerPayment(payment: OrderPayment, buyerId?: string | null) {
  if (!isPaidPaymentStatus(payment.status)) return false;
  if (isRequestPayoutPayment(payment)) return false;
  if (!payment.paidBy || !buyerId) return true;
  return payment.paidBy === buyerId;
}

function isEscrowPayoutPayment(payment: OrderPayment, buyerId?: string | null) {
  if (!isPaidPaymentStatus(payment.status)) return false;
  if (isRequestPayoutPayment(payment)) return true;
  return Boolean(payment.paidBy && buyerId && payment.paidBy !== buyerId);
}

function formatPaidAt(value?: string | null) {
  if (!value) return "-";

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

const REVIEW_CRITERIA_LABELS: Record<string, { en: string; kh: string }> = {
  crop_quality: { en: "Crop Quality", kh: "គុណភាពកសិផល" },
  cropQuality: { en: "Crop Quality", kh: "គុណភាពកសិផល" },
  contract_quality: { en: "Contract Reliability", kh: "ភាពជឿទុកចិត្តនៃកិច្ចសន្យា" },
  contractQuality: { en: "Contract Reliability", kh: "ភាពជឿទុកចិត្តនៃកិច្ចសន្យា" },
  delivery_performance: { en: "Delivery Performance", kh: "ប្រសិទ្ធភាពនៃការដឹកជញ្ជូន" },
  deliveryPerformance: { en: "Delivery Performance", kh: "ប្រសិទ្ធភាពនៃការដឹកជញ្ជូន" },
  payment_promptness: { en: "Payment Promptness", kh: "ភាពទាន់ពេលវេលានៃការបង់ប្រាក់" },
  paymentPromptness: { en: "Payment Promptness", kh: "ភាពទាន់ពេលវេលានៃការបង់ប្រាក់" },
  ease_of_transaction: { en: "Ease of Transaction", kh: "ភាពងាយស្រួលនៃប្រតិបត្តិការ" },
  easeOfTransaction: { en: "Ease of Transaction", kh: "ភាពងាយស្រួលនៃប្រតិបត្តិការ" },
  communication: { en: "Communication", kh: "ការទំនាក់ទំនង" },
  overall_rating: { en: "Overall Rating", kh: "ការវាយតម្លៃសរុប" },
  overallRating: { en: "Overall Rating", kh: "ការវាយតម្លៃសរុប" },
};

function formatCriteriaLabel(key: string, lang: Lang) {
  const label = REVIEW_CRITERIA_LABELS[key];
  if (label) return label[lang];

  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RatingStars({ value }: { value: number }) {
  const filledStars = Math.round(Math.max(0, Math.min(5, value)));

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => {
        const isFilled = index < filledStars;

        return (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${
              isFilled ? "fill-amber-400 text-amber-400" : "text-amber-200"
            }`}
          />
        );
      })}
    </span>
  );
}

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "https://s3.detronic11.win/uploads";

// ─── component ────────────────────────────────────────────────────────────────

export default function OrderDetailPage({
  order,
  role,
  farmerProfile,
  buyerProfile,
  alreadyRequested = false,
  deliveryTracking = null,
  reviews = [],
  currentUserId = null,
  activeReportId = null,
}: OrderDetailPageProps) {
  const [requestAmount, setRequestAmount] = useState<number | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [hasOpenPaymentRequest, setHasOpenPaymentRequest] = useState(false);
  const [isRequestPending, startRequestTransition] = useTransition();

  const { language } = useI18n();
  const lang: Lang = language === "kh" ? "kh" : "en";
  const orderLabel = lang === "kh" ? "ការបញ្ជាទិញ" : "Order";

  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!order.chatRoomId || !order.orderId) return;

    let cancelled = false;

    async function fetchPaymentRequests() {
      const messageTexts = await getOrderChatMessageTextsAction(order.chatRoomId);
      if (cancelled) return;

      setHasOpenPaymentRequest(
        hasUnresolvedPaymentRequest(messageTexts, order.orderId),
      );
    }

    void fetchPaymentRequests();

    return () => {
      cancelled = true;
    };
  }, [order.chatRoomId, order.orderId]);

  if (!isClient) {
    return <div className="min-h-screen w-full bg-[#fbf6e9]" />;
  }

  // ─── derived display values ───────────────────────────────────────────────

  const formattedOrderId = formatOrderCode(order.orderId);

  const formatCurrency = (amount: number) =>
    formatCurrencyUtil(amount, getOrderCurrencyCode(order));

  const cropName = getOrderCropName(order);

  const resolveImageUrl = (
    url: string | null | undefined,
    fallback: string,
  ) => {
    if (!url) return fallback;
    if (url.startsWith("http")) return url;
    return `${IMAGE_BASE_URL}/${url}`;
  };

  const resolveProfileImage = (url: string | null | undefined) =>
    resolveImageUrl(url, PROFILE_FALLBACK_IMAGE);

  const cropImage = resolveImageUrl(
    Array.isArray(order.imageUrls) ? order.imageUrls[0] : undefined,
    CROP_FALLBACK_IMAGE,
  );

  const isFarmer = role === UserRole.FARMER;
  const isBuyer = role === UserRole.BUYER || role === UserRole.GOVERNMENT;

  const orderIsAccepted = order.isAccept === true;
  const orderIsRejected = order.isAccept === false;
  const orderAwaitingDecision = order.isAccept == null;
  const orderPayments = (order.payments ?? []) as OrderPayment[];
  const paidPayments = orderPayments.filter((payment) =>
    isBuyerPayment(payment, order.buyerId),
  );
  const escrowPayoutPayments = orderPayments.filter((payment) =>
    isEscrowPayoutPayment(payment, order.buyerId),
  );
  const paidAmount = paidPayments.reduce(
    (sum, payment) => sum + Number(payment.amount ?? 0),
    0,
  );
  const remainingAmount = Math.max(0, Number(order.totalAmount ?? 0) - paidAmount);
  const isContractOrder = Boolean(order.contractId);
  const contractDepositPaid = isContractOrder && paidAmount > 0;
  const paymentSettled =
    remainingAmount <= 0 ||
    (order.remainingAmount ?? 0) <= 0 ||
    order.isCompleted;
  const deliveryConfirmedByBuyer =
    String(deliveryTracking?.status ?? "").toUpperCase() === "CONFIRMED";

  const showBuyerPayment =
    isBuyer &&
    orderIsAccepted &&
    !paymentSettled &&
    !order.isCompleted &&
    !contractDepositPaid;
  const showBuyerUpdateOrder = isBuyer && orderIsRejected && !order.isCompleted;
  const paymentCurrency = getOrderCurrencyCode(order) as "USD" | "KHR";

  const paymentHref = order.contractId
    ? `/payment-demands?orderId=${order.orderId}`
    : `/payment-crop-product?orderId=${order.orderId}`;
  const updateOrderHref = `/order-crop-product?mode=edit&orderId=${order.orderId}`;
  const chatHref = order.chatRoomId
    ? `/chat?chatRoomId=${order.chatRoomId}`
    : `/chat`;

  // The farmer (withdraw) / buyer (refund) request is only offered while this
  // order's escrow still holds funds. Gate on the live balance rather than the
  // status so it matches the withdraw page's own cap (order.escrowBalance).
  const hasEscrowFunds = (order.escrowBalance ?? 0) > 0;

  const escrowAction = {
    href: `/withdraw?role=${isFarmer ? "farmer" : "buyer"}&orderId=${order.orderId}`,
    label: isFarmer ? t("requestWithdraw", lang) : t("requestRefund", lang),
  };

  const escrowSettled =
    order.escrowStatus === "COMPLETED" || order.escrowStatus === "REFUNDED";

  const showEscrowCard =
    (isFarmer || isBuyer) && (alreadyRequested || hasEscrowFunds || escrowSettled);
  const ownReview = reviews.find((review) => review.reviewerId === currentUserId);
  const receivedReview = reviews.find((review) =>
    isFarmer
      ? review.reviewType === "FARMER_REVIEW"
      : review.reviewType === "BUYER_REVIEW",
  );
  const canShowRatingAction = deliveryConfirmedByBuyer && (isFarmer || isBuyer);
  const ratingHref = `/rating?orderId=${encodeURIComponent(order.orderId)}`;
  const counterpartyRatingLabel = isFarmer
    ? t("ratedByBuyer", lang)
    : t("ratedByFarmer", lang);
  const receivedCriteriaEntries = Object.entries(
    receivedReview?.criteriaScores ?? {},
  ).filter(([, value]) => Number.isFinite(Number(value)));
  const partialRequestAmount = requestAmount ?? remainingAmount;
  const hasPendingPaymentRequest = requestSent || hasOpenPaymentRequest;
  const canRequestRemaining =
    isContractOrder &&
    isBuyer &&
    contractDepositPaid &&
    remainingAmount > 0 &&
    !paymentSettled &&
    Boolean(order.chatRoomId) &&
    !hasPendingPaymentRequest &&
    partialRequestAmount > 0 &&
    partialRequestAmount <= remainingAmount;

  function handleCreatePaymentRequest() {
    if (!canRequestRemaining) {
      setRequestError(
        order.chatRoomId
          ? "Enter a valid amount up to the remaining balance."
          : "No chat room found for this order.",
      );
      return;
    }

    setRequestError(null);
    setRequestSent(false);
    startRequestTransition(async () => {
      const result = await sendChatMessageAction({
        chatRoomId: order.chatRoomId ?? "",
        content: buildPaymentRequestMessage({
          order,
          cropName,
          amount: partialRequestAmount,
          currency: paymentCurrency,
          paidBefore: paidAmount,
        }),
      });

      if (!result.success) {
        setRequestError(result.error ?? "Failed to send payment request.");
        return;
      }

      setRequestSent(true);
      setHasOpenPaymentRequest(true);
    });
  }

  const statusTitle = orderIsRejected
    ? t("rejected", lang)
    : orderAwaitingDecision
      ? t("awaitingDecision", lang)
      : paymentSettled
        ? "Paid"
        : t("accepted", lang);
  const statusDescription = orderIsRejected
    ? "The farmer rejected this order. You can update and send it again."
    : orderAwaitingDecision
      ? "The farmer needs to accept this order before payment."
      : paymentSettled
        ? "Payment is complete. Continue with delivery when the crop is ready."
        : contractDepositPaid
          ? "The contract deposit is paid. Request and pay remaining amounts from chat after farmer approval."
          : isContractOrder
            ? "The farmer accepted this contract order. The buyer can pay the deposit now."
            : "The farmer accepted this order. The buyer can pay now.";

  const escrowUnavailableMessage = escrowSettled
    ? isFarmer
      ? t("escrowSettledWithdraw", lang)
      : t("escrowSettledRefund", lang)
    : isFarmer
      ? t("escrowPendingWithdraw", lang)
      : t("escrowPendingRefund", lang);

  const farmerPhone = formatCambodiaPhone(farmerProfile?.basicInfo.phoneNumber);
  const farmerEmail = farmerProfile?.basicInfo.email?.trim();
  const farmerDisplayName =
    farmerProfile?.personalInfo.fullName || order.farmerName || "Farmer";
  const buyerDisplayName =
    buyerProfile?.personalInfo.fullName || order.buyerName || "Buyer";
  const normalizeUserId = (value?: string | null) => value?.trim().toLowerCase();
  const matchesAnyUserId = (
    value: string | null | undefined,
    ids: Array<string | null | undefined>,
  ) => {
    const normalizedValue = normalizeUserId(value);
    if (!normalizedValue) return false;

    return ids.some((id) => normalizeUserId(id) === normalizedValue);
  };
  const farmerIds = [
    order.farmerId,
    farmerProfile?.basicInfo.userId,
    farmerProfile?.personalInfo.farmerProfileId,
  ];
  const buyerIds = [
    order.buyerId,
    buyerProfile?.basicInfo.userId,
    buyerProfile?.personalInfo.buyerProfileId,
  ];
  const getEscrowPayoutRecipient = (payment: OrderPayment) => {
    const directName =
      payment.releasedToName ||
      payment.recipientName ||
      payment.paidToName ||
      payment.requesterName ||
      payment.fullName ||
      payment.userName;

    if (directName?.trim()) return directName.trim();

    const recipientIds = [
      payment.releasedToId,
      payment.releasedTo,
      payment.recipientId,
      payment.paidToId,
      payment.paidTo,
      payment.requesterId,
      payment.requestedBy,
      payment.paidBy,
    ];

    if (recipientIds.some((id) => matchesAnyUserId(id, farmerIds))) {
      return farmerDisplayName;
    }

    if (recipientIds.some((id) => matchesAnyUserId(id, buyerIds))) {
      return buyerDisplayName;
    }

    const requestType = getPaymentRequestType(payment);
    if (requestType === "REFUND") return buyerDisplayName;

    return farmerDisplayName;
  };

  return (
    <div className={`min-h-screen overflow-x-clip px-4 py-6 md:px-12 md:py-10 ${lang === "kh" ? "font-khmer" : ""}`}>
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 pl-3 text-xs text-muted md:text-sm">
        <Link href="/" className="hover:underline">
          {t("home", lang)}
        </Link>
        <span>&rsaquo;</span>
        <Link href="/order-history" className="hover:underline text-muted">
          {t("orderHistory", lang)}
        </Link>
        <span>&rsaquo;</span>
        <span className="font-bold text-primary">{t("orderDetail", lang)}</span>
      </nav>

      <div className="mx-auto max-w-7xl bg-white border border-none rounded-3xl p-2 shadow-sm md:p-6">
        <div className="p-4">
          {/* Top Control Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/order-history"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
                {orderLabel} {formattedOrderId}
              </h1>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              {/* Delivery Link with TruckIcon */}
              <Link
                href={`/delivery?role=${isFarmer ? "farmer" : "buyer"}&orderId=${order.orderId}`}
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-600 px-5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:border-emerald-700 hover:bg-emerald-700 active:scale-[0.98] sm:w-auto"
              >
                <TruckIcon className="h-5 w-5" />
                <span>{t("delivery", lang)}</span>
              </Link>

              {/* When the viewer already has an active report on this order,
                  link to it (where they can track status / upload more proof);
                  otherwise let them file a new report. */}
              {activeReportId ? (
                <Link
                  href={`/report/${activeReportId}`}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 text-xs font-bold uppercase tracking-wide text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-[0.98] sm:w-auto"
                >
                  <ExclamationCircleIcon className="h-5 w-5" />
                  <span>{t("viewReport", lang)}</span>
                </Link>
              ) : (
                <Link
                  href={`/report?orderId=${order.orderId}&reportedUserId=${isFarmer ? order.buyerId : order.farmerId}&role=${isFarmer ? "farmer" : "buyer"}`}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-600 px-5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:border-red-700 hover:bg-red-700 active:scale-[0.98] sm:w-auto"
                >
                  <ExclamationCircleIcon className="h-5 w-5" />
                  <span>{t("reportIssue", lang)}</span>
                </Link>
              )}
            </div>
          </div>

          <section className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Current status
                </p>
                <h2 className="mt-1 text-2xl font-extrabold text-gray-950">
                  {statusTitle}
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-medium text-gray-600">
                  {statusDescription}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {showBuyerPayment && (
                  <Link
                    href={paymentHref}
                    className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:brightness-95"
                  >
                    <CreditCard className="h-4 w-4" />
                    {isContractOrder ? "Pay Deposit" : t("payNow", lang)}
                  </Link>
                )}
                {showBuyerUpdateOrder && (
                  <Link
                    href={updateOrderHref}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#F5B02E] px-5 py-3 text-sm font-bold text-primary-heading transition hover:bg-[#e5a022]"
                  >
                    <CreditCard className="h-4 w-4" />
                    {t("updateOrder", lang)}
                  </Link>
                )}
                {order.chatRoomId && (
                  <Link
                    href={chatHref}
                    className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-white px-5 py-3 text-sm font-bold text-primary transition hover:bg-primary/5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {t("goToChat", lang)}
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* ── LEFT: Product + Financials ── */}
            <div className="flex flex-col gap-6 lg:col-span-8">
              {/* Crop Card */}
              <div className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row">
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl border border-gray-100 sm:w-52">
                  <CropImage
                    src={cropImage}
                    alt={cropName}
                    fallback={CROP_FALLBACK_IMAGE}
                  />
                </div>

                <div className="flex min-w-0 flex-col justify-between py-1">
                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-bold text-gray-900">
                      {cropName}
                    </h2>
                    <p className="mt-2 max-w-120 text-sm font-medium leading-relaxed text-gray-500">
                      {order.post?.description?.trim() ||
                        t("noDescription", lang)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {order.unitType === "TON"
                          ? t("pricePerTon", lang)
                          : t("pricePerKg", lang)}
                      </span>
                      <span className="mt-0.5 block text-xl font-bold text-primary">
                        {formatCurrency(order.pricePerUnit)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {t("quantity", lang)}
                      </span>
                      <span className="mt-0.5 block text-xl font-bold text-primary">
                        {order.quantity}{" "}
                        {order.unitType === "TON" ? "TON" : "KG"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Order Summary
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      The basic order terms in one place.
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      paymentSettled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {paymentSettled ? "Paid" : "Not paid yet"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <SummaryTile
                    label={t("quantity", lang)}
                    value={`${order.quantity} ${order.unitType === "TON" ? "TON" : "KG"}`}
                  />
                  <SummaryTile
                    label={t("unitPrice", lang)}
                    value={`${formatCurrency(order.pricePerUnit)} / ${order.unitType === "TON" ? "TON" : "KG"}`}
                  />
                  <SummaryTile
                    label={t("totalAmount", lang)}
                    value={formatCurrency(order.totalAmount)}
                    highlight
                  />
                  <SummaryTile
                    label={t("totalPaid", lang)}
                    value={formatCurrency(paidAmount)}
                  />
                  <SummaryTile
                    label={t("remainingBalance", lang)}
                    value={formatCurrency(remainingAmount)}
                    highlight={!paymentSettled}
                  />
                </div>

                {paymentSettled && (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
                    Payment is complete. Delivery can be tracked from the delivery page.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ReceiptText className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {t("paymentHistory", lang)}
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("paidPaymentsOnly", lang)}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {paidPayments.length} Paid
                  </span>
                </div>

                {paidPayments.length > 0 ? (
                  <div className="overflow-hidden">
                    <table className="w-full table-fixed text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("paymentId", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("amount", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("method", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("paidAt", lang)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paidPayments.map((payment) => (
                          <tr
                            key={payment.paymentId}
                            className="border-t border-gray-100 text-gray-700"
                          >
                            <td className="break-words px-4 py-3 font-semibold text-gray-950">
                              {formatPaymentCode(payment.paymentId)}
                            </td>
                            <td className="px-4 py-3 font-bold text-primary">
                              {formatCurrency(Number(payment.amount ?? 0))}
                            </td>
                            <td className="break-words px-4 py-3 text-gray-500">
                              {payment.method ?? "KHQR"}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {formatPaidAt(payment.paidAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-500">
                    {t("noPaidPayments", lang)}
                  </div>
                )}
              </div>

              {escrowPayoutPayments.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <BadgeDollarSign className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {t("escrowPayoutHistory", lang)}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("escrowPayoutsOnly", lang)}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {escrowPayoutPayments.length} Payout
                    </span>
                  </div>

                  <div className="overflow-hidden">
                    <table className="w-full table-fixed text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("paymentId", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("amount", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("method", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("releasedTo", lang)}
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">
                            {t("releasedAt", lang)}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {escrowPayoutPayments.map((payment) => (
                          <tr
                            key={payment.paymentId}
                            className="border-t border-gray-100 text-gray-700"
                          >
                            <td className="break-words px-4 py-3 font-semibold text-gray-950">
                              {formatPaymentCode(payment.paymentId)}
                            </td>
                            <td className="px-4 py-3 font-bold text-primary">
                              {formatCurrency(Number(payment.amount ?? 0))}
                            </td>
                            <td className="break-words px-4 py-3 text-gray-500">
                              {payment.method ?? "KHQR"}
                            </td>
                            <td className="break-words px-4 py-3 font-semibold text-gray-700">
                              {getEscrowPayoutRecipient(payment)}
                            </td>
                            <td className="break-words px-4 py-3 text-gray-500">
                              {formatPaidAt(payment.paidAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── RIGHT: Contact + Actions ── */}
            <div className="flex flex-col gap-6 lg:col-span-4">
              {isContractOrder && (
                <section className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-primary">
                        Contract Payments
                      </p>
                      <h3 className="text-sm font-bold text-primary-heading">
                        {cropName}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-semibold text-secondary-body">
                    <PaymentRow
                      label="Total"
                      value={formatCurrency(Number(order.totalAmount ?? 0))}
                    />
                    <PaymentRow label="Paid" value={formatCurrency(paidAmount)} />
                    <PaymentRow
                      label="Remaining"
                      value={formatCurrency(remainingAmount)}
                    />
                  </div>

                  {paymentSettled ? (
                    <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary">
                      Fully paid. Delivery tracking is now available.
                    </p>
                  ) : !contractDepositPaid ? (
                    <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-secondary-body">
                      Pay the contract deposit first from the Order Created card.
                    </p>
                  ) : isBuyer ? (
                    <div className="mt-4 space-y-3">
                      <label className="block text-xs font-bold text-secondary-body">
                        Next remaining payment amount
                        <input
                          type="number"
                          min={paymentCurrency === "KHR" ? 1 : 0.01}
                          max={remainingAmount}
                          step={paymentCurrency === "KHR" ? 1 : 0.01}
                          value={partialRequestAmount}
                          onChange={(event) => {
                            const nextAmount = Number(event.target.value);
                            setRequestAmount(
                              Number.isFinite(nextAmount) ? nextAmount : 0,
                            );
                            setRequestSent(false);
                            setRequestError(null);
                          }}
                          className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm font-bold text-primary-heading outline-none focus:border-primary"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={!canRequestRemaining || isRequestPending}
                        onClick={handleCreatePaymentRequest}
                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {isRequestPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        Send Payment Request
                      </button>
                      {requestSent && (
                        <p className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary">
                          Payment request sent to chat.
                        </p>
                      )}
                      {hasPendingPaymentRequest && !requestSent && (
                        <p className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-secondary-body">
                          Waiting for the farmer to accept or reject your current request.
                        </p>
                      )}
                      {requestError && (
                        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                          {requestError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-secondary-body">
                      Waiting for the buyer to request farmer approval for the next remaining payment.
                    </p>
                  )}
                </section>
              )}

              {/* Contact Information */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                  {t("contactInformation", lang)}
                </h3>

                {/* Supplier / Farmer */}
                <div className="mb-5 border-b border-gray-100 pb-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">
                      {t("supplierFarmer", lang)}
                    </span>
                    <span className="rounded-md border border-green-100 bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-green-700">
                      {t("farmerBadge", lang)}
                    </span>
                  </div>
                  <Link
                    href={`/other-profile/farmer/${order.farmerId}`}
                    className="group -m-1 flex items-center gap-3 rounded-lg p-1 transition hover:bg-gray-50 active:scale-[0.99]"
                  >
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                      <Image
                        src={resolveProfileImage(
                          farmerProfile?.basicInfo.profileUrl,
                        )}
                        alt={order.farmerName || t("farmerProfileAlt", lang)}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-gray-900 transition group-hover:text-primary">
                        {farmerProfile?.personalInfo.fullName || "—"}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                        {farmerPhone ? (
                          <>
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{farmerPhone}</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {farmerEmail || "—"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Buyer */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">
                      {t("buyerLabel", lang)}
                    </span>
                    <span className="rounded-md border border-purple-100 bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-purple-700">
                      {t("buyerBadge", lang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                      <Image
                        src={resolveProfileImage(
                          buyerProfile?.basicInfo.profileUrl,
                        )}
                        alt={order.buyerName || t("buyerProfileAlt", lang)}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-gray-900">
                        {buyerProfile?.personalInfo.fullName || "—"}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">
                          {buyerProfile?.basicInfo.email || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">
                  {t("ratingSummary", lang)}
                </h3>

                {receivedReview ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-amber-800">
                        {counterpartyRatingLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {Number(receivedReview.overallRating ?? 0).toFixed(1)}
                      </span>
                    </div>
                    {receivedCriteriaEntries.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-amber-100 pt-3">
                        {receivedCriteriaEntries.map(([criteriaKey, value]) => {
                          const score = Number(value);

                          return (
                            <div
                              key={criteriaKey}
                              className="flex items-center justify-between gap-3"
                            >
                              <span className="min-w-0 truncate text-xs font-semibold text-gray-700">
                                {formatCriteriaLabel(criteriaKey, lang)}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1.5">
                                <RatingStars value={score} />
                                <span className="w-6 text-right text-[11px] font-bold text-amber-700">
                                  {score.toFixed(1)}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {receivedReview.feedback && (
                      <p className="mt-2 text-xs font-medium leading-5 text-gray-600">
                        {receivedReview.feedback}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                    {t("noCounterpartyRating", lang)}
                  </p>
                )}

                {canShowRatingAction && (
                  ownReview ? (
                    <div className="mt-3">
                      <button
                        type="button"
                        disabled
                        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm font-bold text-emerald-700"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {t("rated", lang)}
                      </button>
                      <p className="mt-2 text-xs font-medium text-gray-400">
                        {t("yourRatingSubmitted", lang)}
                      </p>
                    </div>
                  ) : (
                    <Link
                      href={ratingHref}
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-[#FDBA3B] p-3.5 text-sm font-bold uppercase text-primary-heading transition hover:border-amber-500 hover:bg-amber-400 active:scale-[0.98]"
                    >
                      <Star className="h-4 w-4 shrink-0" />
                      {t("rating", lang)}
                    </Link>
                  )
                )}
              </div>

              {/* Escrow Actions */}
              {showEscrowCard && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-500">
                    {isFarmer ? t("requestWithdraw", lang) : t("requestRefund", lang)}
                  </h3>

                  {alreadyRequested ? (
                    <>
                      <p className="mb-4 text-xs font-medium text-gray-400">
                        {t("requestReceived", lang)}
                      </p>
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-center text-sm font-bold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>
                          {isFarmer
                            ? t("withdrawSubmitted", lang)
                            : t("refundSubmitted", lang)}
                        </span>
                      </div>
                    </>
                  ) : hasEscrowFunds ? (
                    <>
                      <p className="mb-4 text-xs font-medium text-gray-400">
                        {t("manageEscrow", lang)}
                      </p>
                      <Link
                        href={escrowAction.href}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-center text-sm font-bold text-rose-700 transition-all duration-200 hover:bg-rose-100/80 active:scale-98 focus:outline-none"
                      >
                        {isFarmer ? (
                          <BadgeDollarSign className="h-4 w-4 shrink-0" />
                        ) : (
                          <RotateCcw className="h-4 w-4 shrink-0" />
                        )}
                        <span>{escrowAction.label}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="mb-4 text-xs font-medium text-gray-400">
                        {t("manageEscrow", lang)}
                      </p>
                      <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-center text-sm font-semibold text-gray-500">
                        <Lock className="h-4 w-4 shrink-0" />
                        <span>{escrowUnavailableMessage}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
