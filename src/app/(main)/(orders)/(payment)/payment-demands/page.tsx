import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrderByIdService, type Order } from "@/services/order.service";
import { getPaymentsByOrderIdService } from "@/services/payment.service";
import { getPaymentCurrencyCode } from "@/utils/currency";
import PaymentEscrowClient from "../_component/PaymentEscrowClient";
import type { EscrowPayment } from "../_types/payment";

type PageProps = {
  searchParams: Promise<{
    orderId?: string;
    amount?: string;
  }>;
};

// Human-readable label shown in the "Escrow Status" KPI before any on-page
// payment action has run. The live flow state takes over once the buyer pays.
const ESCROW_STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting",
  FUNDED: "Funds Locked",
  PARTIALLY_RELEASED: "Partially Released",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
};

function isPaidStatus(value: unknown) {
  const status = String(value ?? "").toUpperCase();
  return status === "PAID" || status === "SUCCESS";
}

function isBuyerPayment(
  payment: { status?: unknown; paidBy?: string | null },
  buyerId?: string | null,
) {
  if (!isPaidStatus(payment.status)) return false;
  if (!payment.paidBy || !buyerId) return true;
  return payment.paidBy === buyerId;
}

// Maps a crop-demand order onto the read-only escrow payment view. The page
// itself carries no money state — the only mutation is the buyer's KHQR pay
// action inside PaymentEscrowClient.
function toEscrowPayment(
  order: Order,
  payments: Awaited<ReturnType<typeof getPaymentsByOrderIdService>>,
  approvedPaymentAmount?: number,
): EscrowPayment {
  const buyerPayments = payments.filter((payment) =>
    isBuyerPayment(payment, order.buyerId),
  );
  const paidAmount = buyerPayments
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const remainingBalance = Math.max(0, order.totalAmount - paidAmount);

  // Deposit as a percentage of the order total, derived from the order's actual
  // deposit amount (not a percentage the buyer picks).
  const depositPercent =
    order.totalAmount > 0
      ? Math.round((order.depositAmount / order.totalAmount) * 100)
      : 0;

  const qty = `${order.quantity} ${order.unitType}`;
  const escrowStatus = order.escrowStatus
    ? (ESCROW_STATUS_LABEL[order.escrowStatus] ?? order.escrowStatus)
    : "Awaiting";

  return {
    id: order.orderId,
    orderId: order.orderId,
    contractId: order.contractId,
    contractAmount: order.totalAmount,
    depositPercent,
    depositAmount: order.depositAmount,
    remainingBalance,
    currencyCode: getPaymentCurrencyCode(order.currencyCode),
    escrowStatus,
    buyerName: order.buyerName ?? "Buyer",
    buyerId: order.buyerId,
    farmerName: order.farmerName ?? "Farmer",
    productName: order.cropName ?? "Crop Product",
    chatRoomId: order.chatRoomId,
    qty,
    approvedPaymentAmount,
    paymentHistory: buyerPayments.map((payment) => ({
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: payment.status,
      method: "KHQR",
      paidAt: payment.paidAt ?? "",
    })),
  };
}

export default async function PaymentEscrowPage({ searchParams }: PageProps) {
  const { orderId, amount } = await searchParams;

  if (!orderId) {
    redirect("/order-history");
  }

  const session = await auth();
  if (!session?.user?.accessToken) {
    redirect("/login");
  }

  const [order, payments] = await Promise.all([
    getOrderByIdService(orderId),
    getPaymentsByOrderIdService(orderId),
  ]);

  if (!order) {
    redirect("/order-history");
  }

  const approvedPaymentAmount = Number(amount ?? 0);

  return (
    <PaymentEscrowClient
      payment={toEscrowPayment(
        order,
        payments,
        Number.isFinite(approvedPaymentAmount) && approvedPaymentAmount > 0
          ? approvedPaymentAmount
          : undefined,
      )}
    />
  );
}
