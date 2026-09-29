"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CheckCircle2, CreditCard, Loader2, PackageCheck, Send, Truck } from "lucide-react";
import {
  getOrderPaymentProgressAction,
  getOrderSummaryAction,
} from "@/action/order.action";
import { getDeliveryTrackingAction } from "@/action/delivery-tracking.action";
import { sendChatMessageAction } from "../_actions/sendChatMessageAction";
import type { DeliveryTracking } from "@/services/delivery-tracking.service";
import type { Chat, UserRole } from "../_types/chat";
import { createDeliveryTrackingSocket } from "@/lib/delivery-tracking-socket";

type PaymentOrder = {
  orderId: string;
  crop: string;
  qty: string;
  total: string;
  buyer: string;
  currency?: string;
  chatRoomId?: string;
  paymentPath?: string;
  price?: string;
  delivery?: string;
  isPaidMessage?: boolean;
};

type PaymentProgress = {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
};

type OrderSummary = Awaited<ReturnType<typeof getOrderSummaryAction>>;

type Props = {
  chat: Chat;
  role: UserRole;
};

export default function ChatPaymentPanel({ chat, role }: Props) {
  const { data: session } = useSession();
  const contractOrder = useMemo(() => findLatestContractOrder(chat), [chat]);
  const cropProductOrder = useMemo(() => findLatestCropProductOrder(chat), [chat]);
  const order = chat.chatType === "CROP_DEMAND" ? contractOrder : cropProductOrder;
  const [progress, setProgress] = useState<PaymentProgress>({
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    isFullyPaid: false,
  });
  const [requestAmount, setRequestAmount] = useState(0);
  const [deliveryTracking, setDeliveryTracking] =
    useState<DeliveryTracking | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>(null);
  const [localPendingRequest, setLocalPendingRequest] =
    useState<{ orderId: string; requestId: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const isBuyer = role === "BUYER" || role === "GOVERNMENT";
  const currency = order?.currency === "KHR" ? "KHR" : "USD";
  const isContractOrder = order?.paymentPath === "/payment-demands";

  useEffect(() => {
    if (!order?.orderId) return;
    const orderId = order.orderId;

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function fetchProgress() {
      const nextProgress = await getOrderPaymentProgressAction(orderId);
      if (cancelled) return;
      setProgress(nextProgress);
      setRequestAmount((current) => {
        if (current > 0 && current <= nextProgress.remainingAmount) return current;
        return nextProgress.remainingAmount;
      });
      if (nextProgress.isFullyPaid && interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    void fetchProgress();
    interval = setInterval(fetchProgress, 10000);

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [order?.orderId]);

  useEffect(() => {
    if (!order?.orderId) return;
    const orderId = order.orderId;

    let cancelled = false;

    async function fetchOrderSummary() {
      const summary = await getOrderSummaryAction(orderId);
      if (cancelled) return;

      setOrderSummary(summary);
    }

    void fetchOrderSummary();

    return () => {
      cancelled = true;
    };
  }, [order?.orderId]);

  useEffect(() => {
    if (!order?.orderId) return;
    const orderId = order.orderId;

    let cancelled = false;

    async function fetchTracking() {
      const nextTracking = await getDeliveryTrackingAction(orderId);
      if (cancelled) return;

      setDeliveryTracking(nextTracking);
    }

    void fetchTracking();

    return () => {
      cancelled = true;
    };
  }, [order?.orderId]);

  useEffect(() => {
    const token = session?.user?.accessToken;
    const orderId = order?.orderId;
    if (!token || !orderId) return;

    const client = createDeliveryTrackingSocket({
      token,
      onTrackingUpdate: (event) => {
        const nextTracking = event.tracking;
        if (!nextTracking || nextTracking.orderId !== orderId) return;

        setDeliveryTracking(nextTracking);
      },
    });

    if (!client) return;

    client.activate();

    return () => {
      void client.deactivate();
    };
  }, [order?.orderId, session?.user?.accessToken]);

  if (!order) return null;

  if (!isContractOrder) {
    return (
      <CropProductOrderPanel
        order={order}
        role={role}
        progress={progress}
        currency={currency}
        deliveryTracking={deliveryTracking}
        orderSummary={orderSummary}
      />
    );
  }

  if (chat.chatType !== "CROP_DEMAND") return null;

  const totalAmount = progress.totalAmount || parseMoney(order.total);
  const paidAmount = progress.paidAmount;
  const remainingAmount = progress.remainingAmount || Math.max(0, totalAmount - paidAmount);
  const depositPaid = paidAmount > 0;
  const hasPendingPaymentRequest =
    Boolean(
      order?.orderId &&
        localPendingRequest?.orderId === order.orderId &&
        !hasPaymentRequestDecision(chat.messages, localPendingRequest.requestId),
    ) ||
    hasUnresolvedPaymentRequest(chat.messages, order.orderId);
  const canRequestRemaining =
    isBuyer &&
    depositPaid &&
    remainingAmount > 0 &&
    !progress.isFullyPaid &&
    !hasPendingPaymentRequest;

  function handleCreateRequest() {
    if (!order || requestAmount <= 0 || requestAmount > remainingAmount) return;

    const requestId = `${order.orderId}-${Date.now()}`;

    startTransition(async () => {
      const result = await sendChatMessageAction({
        chatRoomId: chat.chatRoomId,
        content: buildPaymentRequestMessage({
          requestId,
          order,
          amount: requestAmount,
          currency,
          chatRoomId: chat.chatRoomId,
          paidBefore: paidAmount,
        }),
      });
      if (result.success) {
        setLocalPendingRequest({ orderId: order.orderId, requestId });
      }
    });
  }

  return (
    <>
      <section className="border-t border-light-grey p-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Contract Payments
              </p>
              <h3 className="text-sm font-bold text-primary-heading">
                {order.crop}
              </h3>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs font-semibold text-secondary-body">
            <PaymentRow label="Total" value={formatMoney(totalAmount, currency)} />
            <PaymentRow label="Paid" value={formatMoney(paidAmount, currency)} />
            <PaymentRow label="Remaining" value={formatMoney(remainingAmount, currency)} />
          </div>

          {progress.isFullyPaid ? (
            <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-bold text-primary">
              Fully paid. Delivery tracking is now available.
            </p>
          ) : !depositPaid ? (
            <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-secondary-body">
              Pay the contract deposit first from the Order Created card.
            </p>
          ) : isBuyer ? (
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-secondary-body">
                Next remaining payment amount
                <input
                  type="number"
                  min={currency === "KHR" ? 1 : 0.01}
                  max={remainingAmount}
                  step={currency === "KHR" ? 1 : 0.01}
                  value={requestAmount}
                  onChange={(event) => {
                    const nextAmount = Number(event.target.value);
                    setRequestAmount(Number.isFinite(nextAmount) ? nextAmount : 0);
                  }}
                  className="mt-2 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm font-bold text-primary-heading outline-none focus:border-primary"
                />
              </label>
              <button
                type="button"
                disabled={!canRequestRemaining || isPending}
                onClick={handleCreateRequest}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Payment Request
              </button>
              {hasPendingPaymentRequest && (
                <p className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-secondary-body">
                  Waiting for the farmer to accept or reject your current request.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-secondary-body">
              Waiting for the buyer to request farmer approval for the next remaining payment.
            </p>
          )}
        </div>
      </section>

      {progress.isFullyPaid && (
        <CropProductOrderPanel
          order={order}
          role={role}
          progress={progress}
          currency={currency}
          deliveryTracking={deliveryTracking}
          orderSummary={orderSummary}
        />
      )}
    </>
  );
}

function CropProductOrderPanel({
  order,
  role,
  progress,
  currency,
  deliveryTracking,
  orderSummary,
}: {
  order: PaymentOrder;
  role: UserRole;
  progress: PaymentProgress;
  currency: "USD" | "KHR";
  deliveryTracking: DeliveryTracking | null;
  orderSummary: OrderSummary;
}) {
  const viewerRole = role === "FARMER" ? "farmer" : "buyer";
  const isPaid = progress.isFullyPaid || Boolean(order.isPaidMessage);
  const quantity = orderSummary?.quantity ?? parseQuantity(order.qty);
  const unitType = orderSummary?.unitType || parseUnitType(order.qty);
  const pricePerUnit = orderSummary?.pricePerUnit ?? parseMoney(order.price ?? "");
  const calculatedTotal = quantity * pricePerUnit;
  const totalAmount =
    orderSummary?.totalAmount ||
    (calculatedTotal > 0 ? calculatedTotal : progress.totalAmount || parseMoney(order.total));
  const displayCurrency =
    orderSummary?.currencyCode === "KHR" || orderSummary?.currencyCode === "USD"
      ? orderSummary.currencyCode
      : currency;
  const paidAmount = progress.paidAmount || (isPaid ? totalAmount : 0);
  const orderDetailHref = `/order-history/${encodeURIComponent(order.orderId)}`;
  const deliveryHref = `/delivery?role=${viewerRole}&orderId=${encodeURIComponent(order.orderId)}`;
  const deliveryStatus = getDeliveryStatus(deliveryTracking);
  const isDeliveryComplete = deliveryStatus === "Completed";
  const deliveryButtonLabel = isDeliveryComplete ? "View Delivery" : "Delivery Info";

  return (
    <section className="border-t border-light-grey p-4">
      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-primary">
            {isPaid ? <Truck className="h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">
              Order & Delivery
            </p>
            <h3 className="text-sm font-bold text-primary-heading">
              {order.crop}
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs font-semibold text-secondary-body">
          {quantity > 0 && (
            <PaymentRow label="Quantity" value={`${formatQuantity(quantity)} ${unitType}`} />
          )}
          {pricePerUnit > 0 && (
            <PaymentRow label="Price per unit" value={formatMoney(pricePerUnit, displayCurrency)} />
          )}
          <PaymentRow label="Total" value={formatMoney(totalAmount, displayCurrency)} />
          <PaymentRow label="Paid" value={formatMoney(paidAmount, displayCurrency)} />
          {isPaid && <PaymentRow label="Delivery Status" value={deliveryStatus} />}
        </div>

        <div
          className={`mt-4 rounded-xl px-3 py-2 text-xs font-semibold leading-relaxed ${
            isPaid
              ? "bg-emerald-50 text-primary"
              : "bg-slate-50 text-secondary-body"
          }`}
        >
          {isPaid ? (
            <span className="flex items-start gap-2">
              {isDeliveryComplete ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <Truck className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              {getDeliveryStatusMessage(deliveryStatus)}
            </span>
          ) : role === "BUYER" ? (
            "Waiting for this order payment to complete."
          ) : (
            "Waiting for buyer payment before delivery tracking starts."
          )}
        </div>

        <div className="mt-4 grid gap-2">
          {isPaid && (
            <Link
              href={deliveryHref}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-white transition hover:brightness-95"
            >
              <Truck className="h-4 w-4" />
              {deliveryButtonLabel}
            </Link>
          )}
          <Link
            href={orderDetailHref}
            className="flex h-10 w-full items-center justify-center rounded-xl border border-primary/20 bg-white text-xs font-bold text-primary transition hover:bg-primary/5"
          >
            Order Detail
          </Link>
        </div>
      </div>
    </section>
  );
}

function getDeliveryStatus(tracking: DeliveryTracking | null) {
  if (tracking?.status === "CONFIRMED") {
    return "Completed";
  }

  if (tracking?.status === "IN_TRANSIT" || tracking?.isFarmerConfirmed) {
    return "In Transit";
  }

  return "Pending";
}

function getDeliveryStatusMessage(status: string) {
  if (status === "Completed") {
    return "Delivery is completed. The buyer has confirmed receipt.";
  }

  if (status === "In Transit") {
    return "Payment is complete. Delivery is in transit and waiting for buyer confirmation.";
  }

  return "Payment is complete. Delivery has not been confirmed as sent yet.";
}

function PaymentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
      <span>{label}</span>
      <span className="font-bold text-primary-heading">{value}</span>
    </div>
  );
}

function findLatestContractOrder(chat: Chat): PaymentOrder | null {
  for (const message of [...chat.messages].reverse()) {
    const order = parseOrderCreated(message.text ?? "");
    if (order?.paymentPath === "/payment-demands") return order;
  }

  return null;
}

function findLatestCropProductOrder(chat: Chat): PaymentOrder | null {
  for (const message of [...chat.messages].reverse()) {
    const paidOrder = parsePaymentCompleted(message.text ?? "");
    if (paidOrder) return paidOrder;

    const createdOrder = parseOrderCreated(message.text ?? "");
    if (createdOrder && createdOrder.paymentPath !== "/payment-demands") {
      return createdOrder;
    }

    const acceptedOrder = parseOrderAccepted(message.text ?? "");
    if (acceptedOrder && acceptedOrder.paymentPath !== "/payment-demands") {
      return acceptedOrder;
    }

    const requestedOrder = parseOrderRequest(message.text ?? "");
    if (requestedOrder) return requestedOrder;
  }

  return null;
}

function parseOrderCreated(text: string): PaymentOrder | null {
  const lines = text.split("\n").map((line) => line.trim());
  const firstLine = lines[0] ?? "";
  if (!firstLine.startsWith("ORDER_CREATED:")) return null;

  const orderId = firstLine.replace("ORDER_CREATED:", "").trim();
  if (!orderId) return null;

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  return {
    orderId,
    crop: fields.crop ?? "Crop",
    qty: fields.qty ?? "",
    total: fields.total ?? "",
    buyer: fields.buyer ?? "Buyer",
    currency: fields.currency ?? "",
    chatRoomId: fields.chatRoomId ?? "",
    paymentPath: fields.paymentPath ?? "",
    price: fields.price ?? "",
    delivery: fields.delivery ?? "",
  };
}

function parseOrderAccepted(text: string): PaymentOrder | null {
  return parseOrderMessage(text, "ORDER_ACCEPTED:");
}

function parseOrderRequest(text: string): PaymentOrder | null {
  return parseOrderMessage(text, "ORDER_REQUEST:");
}

function parsePaymentCompleted(text: string): PaymentOrder | null {
  const order = parseOrderMessage(text, "PAYMENT_COMPLETED:");
  if (!order) return null;

  return {
    ...order,
    total: order.total || order.price || "",
    isPaidMessage: true,
  };
}

function hasUnresolvedPaymentRequest(messages: Chat["messages"], orderId: string) {
  const resolvedRequestIds = new Set<string>();
  const pendingRequestIds = new Set<string>();

  for (const message of messages) {
    const text = message.text ?? "";
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

function hasPaymentRequestDecision(messages: Chat["messages"], requestId: string) {
  for (const message of messages) {
    const text = message.text ?? "";
    const acceptedRequestId = parsePaymentRequestDecisionId(
      text,
      "PAYMENT_REQUEST_ACCEPTED:",
    );
    const rejectedRequestId = parsePaymentRequestDecisionId(
      text,
      "PAYMENT_REQUEST_REJECTED:",
    );

    if (acceptedRequestId === requestId || rejectedRequestId === requestId) {
      return true;
    }
  }

  return false;
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

function parseOrderMessage(text: string, prefix: string): PaymentOrder | null {
  const lines = text.split("\n").map((line) => line.trim());
  const firstLine = lines[0] ?? "";
  if (!firstLine.startsWith(prefix)) return null;

  const orderId = firstLine.replace(prefix, "").trim();
  if (!orderId) return null;

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    fields[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }

  return {
    orderId,
    crop: fields.crop ?? "Crop Product",
    qty: fields.qty ?? "",
    total: fields.total ?? fields.amount ?? "",
    buyer: fields.buyer ?? "Buyer",
    currency: fields.currency ?? "",
    chatRoomId: fields.chatRoomId ?? "",
    paymentPath: fields.paymentPath ?? "",
    price: fields.price ?? fields.amount ?? "",
    delivery: fields.delivery ?? "",
  };
}

function buildPaymentRequestMessage({
  requestId,
  order,
  amount,
  currency,
  chatRoomId,
  paidBefore,
}: {
  requestId: string;
  order: PaymentOrder;
  amount: number;
  currency: "USD" | "KHR";
  chatRoomId: string;
  paidBefore: number;
}) {
  return [
    `PAYMENT_REQUEST:${requestId}`,
    `orderId:${order.orderId}`,
    `crop:${order.crop}`,
    `qty:${order.qty}`,
    `amount:${amount}`,
    `paidBefore:${paidBefore}`,
    `buyer:${order.buyer}`,
    `currency:${currency}`,
    `chatRoomId:${chatRoomId}`,
  ].join("\n");
}

function parseMoney(value: string) {
  const numeric = Number(value.replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseQuantity(value: string) {
  const numeric = Number(value.match(/-?\d+(\.\d+)?/)?.[0] ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseUnitType(value: string) {
  const unit = value.replace(/-?\d+(\.\d+)?/g, "").trim();
  return unit || "KG";
}

function formatQuantity(value: number) {
  return Number.isInteger(value) ? String(value) : value.toLocaleString();
}

function formatMoney(amount: number, currency: "USD" | "KHR") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "KHR" ? 0 : 2,
  }).format(amount);
}
