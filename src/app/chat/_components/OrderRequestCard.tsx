"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PackageCheck,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
} from "lucide-react";
import {
  acceptOrderAction,
  getOrderIsAcceptAction,
  getOrderPaidStateAction,
  rejectOrderAction,
} from "@/action/order.action";
import { sendChatMessageAction } from "../_actions/sendChatMessageAction";

export type OrderRequestData = {
  orderId: string;
  crop: string;
  qty: string;
  price: string;
  total: string;
  delivery?: string;
  buyer: string;
  currency?: string;
  chatRoomId?: string;
  paymentPath?: string;
};

// Parse a message text that starts with ORDER_REQUEST:{orderId}\n...
export function parseOrderRequest(text: string): OrderRequestData | null {
  if (!text.startsWith("ORDER_REQUEST:")) return null;

  const lines = text.split("\n");
  const firstLine = lines[0];
  const orderId = firstLine.slice("ORDER_REQUEST:".length).trim();
  if (!orderId) return null;

  const fields: Record<string, string> = {};
  for (const line of lines.slice(1)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    fields[key] = value;
  }

  return {
    orderId,
    crop: fields.crop ?? "",
    qty: fields.qty ?? "",
    price: fields.price ?? "",
    total: fields.total ?? "",
    delivery: fields.delivery ?? "",
    buyer: fields.buyer ?? "",
    currency: fields.currency ?? "",
    chatRoomId: fields.chatRoomId ?? "",
    paymentPath: fields.paymentPath ?? "",
  };
}

type Props = {
  data: OrderRequestData;
  // "farmer" sees Accept/Reject; "buyer" sees accepted/rejected status.
  viewerRole: "farmer" | "buyer" | "other";
  chatRoomId?: string;
  forcedDecision?: "accepted" | "rejected" | null;
};

export default function OrderRequestCard(props: Props) {
  return (
    <OrderRequestCardContent
      key={`${props.data.orderId}-${props.viewerRole}`}
      {...props}
    />
  );
}

function OrderRequestCardContent({ data, viewerRole, chatRoomId, forcedDecision = null }: Props) {
  const router = useRouter();
  const [localDecision, setLocalDecision] = useState<"accepted" | "rejected" | null>(null);
  const [serverIsAccept, setServerIsAccept] = useState<boolean | null>(null);
  const [isResolvingStatus, setIsResolvingStatus] = useState(true);
  const [hasResolvedPayment, setHasResolvedPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [pendingAction, setPendingAction] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll the server for order status.
  // - Buyer: polls every 5 s until farmer accepts/rejects.
  // - Farmer: fetches once on mount so they see the correct state after reload.
  //
  // The backend sends isAccept=false for pending orders (Java boolean default),
  // so we ONLY trust server=false when the viewer is the buyer (who can't
  // set that field). For the farmer, false from the server is ignored unless
  // they clicked Reject themselves (captured in localDecision).
  useEffect(() => {
    if (forcedDecision) {
      return;
    }

    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function fetchStatus() {
      const result = await getOrderIsAcceptAction(data.orderId);
      if (cancelled) return;

      if (result === true) {
        // Accepted — valid for both roles
        setServerIsAccept(true);
      } else if (result === false) {
        // Rejected — only trust this signal on the buyer side
        setServerIsAccept(false);
      }
      // For farmer: ignore server false (backend default) — localDecision handles it

      // Buyer keeps polling until a decision is made
      if (viewerRole === "buyer" && result !== true && result !== false) {
        pollInterval = setInterval(async () => {
          const next = await getOrderIsAcceptAction(data.orderId);
          if (cancelled) return;
          if (next === true) {
            setServerIsAccept(true);
            clearInterval(pollInterval!);
            pollInterval = null;
          } else if (next === false) {
            setServerIsAccept(false);
            clearInterval(pollInterval!);
            pollInterval = null;
          }
        }, 5000);
      }
    }

    void fetchStatus().finally(() => {
      if (!cancelled) {
        setIsResolvingStatus(false);
      }
    });
    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [data.orderId, forcedDecision, viewerRole]);

  // Local optimistic state takes priority; server state fills in after reload.
  const accepted =
    forcedDecision === "accepted" ||
    (forcedDecision === null &&
      (localDecision === "accepted" || (localDecision === null && serverIsAccept === true)));
  const rejected =
    forcedDecision === "rejected" ||
    (forcedDecision === null &&
      (localDecision === "rejected" || (localDecision === null && serverIsAccept === false)));
  const pending = !accepted && !rejected;
  const isResolvingDecision = forcedDecision ? false : isResolvingStatus;
  const isResolvingBuyerPayment = viewerRole === "buyer" && accepted && !hasResolvedPayment;

  useEffect(() => {
    if (viewerRole !== "buyer" || !accepted) return;

    let cancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function fetchPaidState() {
      try {
        const paid = await getOrderPaidStateAction(data.orderId);
        if (cancelled) return;

        setIsPaid(paid);

        if (paid && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } finally {
        if (!cancelled) {
          setHasResolvedPayment(true);
        }
      }
    }

    void fetchPaidState();
    pollInterval = setInterval(fetchPaidState, 10000);

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [accepted, data.orderId, viewerRole]);

  async function handleAccept() {
    if (pendingAction) return;

    setError(null);
    setPendingAction("accept");
    try {
      const result = await acceptOrderAction(data.orderId);
      if (result.success) {
        setLocalDecision("accepted");
        if (chatRoomId) {
          await sendChatMessageAction({
            chatRoomId,
            content: buildOrderAcceptedMessage(data),
          });
        }
      } else {
        setError(result.error);
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function handleReject() {
    if (pendingAction) return;

    setError(null);
    setPendingAction("reject");
    try {
      const result = await rejectOrderAction(data.orderId);
      if (result.success) {
        setLocalDecision("rejected");
        if (chatRoomId) {
          await sendChatMessageAction({
            chatRoomId,
            content: buildOrderRejectedMessage(data),
          });
        }
      } else {
        setError(result.error);
      }
    } finally {
      setPendingAction(null);
    }
  }

  function handleViewDetail() {
    router.push(`/order-history/${data.orderId}`);
  }

  return (
    <div className="w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm [&_.text-gray-600]:text-[14px] [&_.text-gray-800]:text-[14px]">
      {/* Header */}
      <div className="flex items-center gap-2 bg-primary/8 px-4 py-3">
        <PackageCheck className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wide text-primary">
          Order Request
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5 px-4 py-3 text-[14px] text-gray-600">
        <Row label="Buyer" value={data.buyer} />
        <Row label="Crop" value={data.crop} />
        <Row label="Qty" value={data.qty} />
        <Row label="Price" value={data.price} />
        {data.delivery && <Row label="Delivery" value={data.delivery} />}
        <div className="flex items-center justify-between border-t border-gray-100 pt-1.5 font-bold text-gray-800">
          <span>Total</span>
          <span className="text-primary">{data.total}</span>
        </div>
      </div>

      {/* Status / Actions */}
      <div className="border-t border-gray-100 px-4 pb-4 pt-3">
        {(isResolvingDecision || isResolvingBuyerPayment) && (
          <OrderActionSkeleton />
        )}

        {/* Status badges */}
        {!isResolvingDecision && accepted && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Order Accepted
          </div>
        )}
        {!isResolvingDecision && rejected && (
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-600">
            <XCircle className="h-3.5 w-3.5" />
            Order Rejected
          </div>
        )}

        {/* Farmer: Accept / Reject */}
        {!isResolvingDecision && viewerRole === "farmer" && pending && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleAccept}
              disabled={pendingAction !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {pendingAction === "accept" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsUp className="h-3.5 w-3.5" />
              )}
              Accept
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={pendingAction !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
            >
              {pendingAction === "reject" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ThumbsDown className="h-3.5 w-3.5" />
              )}
              Reject
            </button>
            {error && (
              <p className="text-[10px] font-medium text-red-500">{error}</p>
            )}
          </div>
        )}

        {/* Buyer: paid orders go to detail. */}
        {!isResolvingDecision && !isResolvingBuyerPayment && viewerRole === "buyer" && accepted && isPaid && (
          <button
            type="button"
            onClick={handleViewDetail}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2 text-xs font-bold text-white transition hover:brightness-90"
          >
            <Eye className="h-3.5 w-3.5" />
            See Detail
          </button>
        )}

        {/* Buyer: rejected request cards stay informational; update comes from the farmer rejection card. */}
        {!isResolvingDecision && viewerRole === "buyer" && rejected && (
          <button
            type="button"
            onClick={handleViewDetail}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white py-2 text-xs font-bold text-primary transition hover:bg-primary/5"
          >
            <Eye className="h-3.5 w-3.5" />
            View Order
          </button>
        )}

        {/* Buyer: waiting for farmer */}
        {!isResolvingDecision && viewerRole === "buyer" && pending && (
          <p className="text-center text-[10px] font-medium text-gray-400">
            Waiting for the farmer to accept...
          </p>
        )}
      </div>
    </div>
  );
}

function buildOrderAcceptedMessage(data: OrderRequestData) {
  return [
    `ORDER_ACCEPTED:${data.orderId}`,
    `crop:${data.crop}`,
    `qty:${data.qty}`,
    `total:${data.total}`,
    `buyer:${data.buyer}`,
    `currency:${data.currency ?? ""}`,
    `chatRoomId:${data.chatRoomId ?? ""}`,
    `paymentPath:${data.paymentPath ?? ""}`,
  ].join("\n");
}

function buildOrderRejectedMessage(data: OrderRequestData) {
  return [
    `ORDER_REJECTED:${data.orderId}`,
    `crop:${data.crop}`,
    `qty:${data.qty}`,
    `total:${data.total}`,
    `buyer:${data.buyer}`,
    `currency:${data.currency ?? ""}`,
    `chatRoomId:${data.chatRoomId ?? ""}`,
    `paymentPath:${data.paymentPath ?? ""}`,
  ].join("\n");
}

function OrderActionSkeleton() {
  return (
    <div className="space-y-2" aria-label="Loading order status">
      <div className="h-3 w-28 animate-pulse rounded-full bg-gray-200" />
      <div className="h-8 w-full animate-pulse rounded-xl bg-gray-200" />
      <div className="h-8 w-full animate-pulse rounded-xl bg-gray-100" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-700">{value}</span>
    </div>
  );
}
