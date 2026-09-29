"use server";

import {
  acceptOrderService,
  rejectOrderService,
  getOrderByIdService,
  getOrderByContractIdService,
  type AcceptOrderResult,
} from "@/services/order.service";
import { getPaymentsByOrderIdService } from "@/services/payment.service";
import { getChatMessagesService } from "@/services/chat.service";

export async function acceptOrderAction(
  orderId: string,
): Promise<AcceptOrderResult> {
  return acceptOrderService(orderId);
}

export async function rejectOrderAction(
  orderId: string,
): Promise<AcceptOrderResult> {
  return rejectOrderService(orderId);
}

export async function getOrderIsAcceptAction(
  orderId: string,
): Promise<boolean | null> {
  const order = await getOrderByIdService(orderId);
  if (!order) return null;
  return order.isAccept ?? null;
}

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

export async function getOrderPaidStateAction(orderId: string): Promise<boolean> {
  if (!orderId) return false;

  const progress = await getOrderPaymentProgressAction(orderId);

  return progress.isFullyPaid;
}

export async function getOrderPaymentProgressAction(orderId: string): Promise<{
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  isFullyPaid: boolean;
}> {
  if (!orderId) {
    return { totalAmount: 0, paidAmount: 0, remainingAmount: 0, isFullyPaid: false };
  }

  const [order, payments] = await Promise.all([
    getOrderByIdService(orderId),
    getPaymentsByOrderIdService(orderId),
  ]);

  const totalAmount = Number(order?.totalAmount ?? 0);
  const paidAmount = payments
    .filter((payment) => isBuyerPayment(payment, order?.buyerId))
    .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  return {
    totalAmount,
    paidAmount,
    remainingAmount,
    isFullyPaid:
      remainingAmount <= 0 ||
      Boolean(order?.isCompleted && Number(order.remainingAmount) <= 0),
  };
}

export async function getOrderSummaryAction(orderId: string): Promise<{
  orderId: string;
  cropName: string;
  quantity: number;
  unitType: string;
  pricePerUnit: number;
  totalAmount: number;
  currencyCode: string;
  isCompleted: boolean;
} | null> {
  if (!orderId) return null;

  const order = await getOrderByIdService(orderId);
  if (!order) return null;

  const quantity = Number(order.quantity ?? 0);
  const pricePerUnit = Number(order.pricePerUnit ?? 0);
  const calculatedTotal = quantity * pricePerUnit;
  const totalAmount = Number.isFinite(calculatedTotal) && calculatedTotal > 0
    ? calculatedTotal
    : Number(order.totalAmount ?? 0);

  return {
    orderId: order.orderId,
    cropName: order.cropName,
    quantity,
    unitType: order.unitType || "KG",
    pricePerUnit,
    totalAmount,
    currencyCode: order.currencyCode || "USD",
    isCompleted: Boolean(order.isCompleted),
  };
}

export async function getOrderChatMessageTextsAction(
  chatRoomId: string,
): Promise<string[]> {
  if (!chatRoomId) return [];

  const messages = await getChatMessagesService(chatRoomId);

  return messages.map((message) => message.content ?? "").filter(Boolean);
}

// Returns the buyer's existing order id for a contract, or null if none exists.
// The order form uses this to redirect to an already-placed order instead of
// failing when the buyer tries to order the same contract twice.
export async function findOrderIdByContractAction(
  contractId: string,
): Promise<string | null> {
  if (!contractId) return null;
  const order = await getOrderByContractIdService(contractId);
  return order?.orderId ?? null;
}

export async function getOrderChatRoomIdAction(
  orderId: string,
): Promise<string | null> {
  if (!orderId) return null;
  const order = await getOrderByIdService(orderId);
  return order?.chatRoomId ?? null;
}
