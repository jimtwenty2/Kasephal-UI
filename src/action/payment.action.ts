"use server";

import {
  cancelPaymentService,
  checkPaymentService,
  createPaymentService,
  getPaymentsByOrderIdService,
  getPaymentStatusService,
  type CreatePaymentInput,
  type Payment,
  type PaymentCheckResult,
  type PaymentResult,
} from "@/services/payment.service";

// Create a KHQR payment for the order's remaining balance.
export async function createPaymentAction(
  input: CreatePaymentInput,
): Promise<PaymentResult> {
  if (!input.orderId) {
    return { success: false, error: "Missing order reference." };
  }
  if (!input.amountToPay || input.amountToPay <= 0) {
    return { success: false, error: "Invalid payment amount." };
  }
  if (!input.currencyCode) {
    return { success: false, error: "Missing currency." };
  }
  if (input.currencyCode !== "USD" && input.currencyCode !== "KHR") {
    return { success: false, error: "Unsupported currency." };
  }

  return createPaymentService(input);
}

// Cancel a still-PENDING payment (used to force a fresh QR for testing).
export async function cancelPaymentAction(
  paymentId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!paymentId) {
    return { success: false, error: "Missing payment reference." };
  }

  return cancelPaymentService(paymentId);
}

// Trigger backend reconciliation against Bakong (by md5), then the caller reads
// the stored status. Returns the live Bakong settled flag.
export async function checkPaymentAction(
  md5: string,
): Promise<PaymentCheckResult> {
  if (!md5) {
    return { success: false, settled: false, error: "Missing payment reference." };
  }

  return checkPaymentService(md5);
}

// Read the payment's stored settlement status via its paymentId.
export async function getPaymentStatusAction(
  paymentId: string,
): Promise<PaymentCheckResult> {
  if (!paymentId) {
    return { success: false, settled: false, error: "Missing payment reference." };
  }

  return getPaymentStatusService(paymentId);
}

export async function getOrderPaymentsAction(orderId: string): Promise<Payment[]> {
  if (!orderId) return [];

  return getPaymentsByOrderIdService(orderId);
}
