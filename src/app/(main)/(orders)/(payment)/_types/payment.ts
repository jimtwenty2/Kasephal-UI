export type EscrowFlowStatus =
  | "IDLE"
  | "KHQR_READY"
  | "QR_EXPIRED"
  | "PAYMENT_SUCCESS"
  | "HOLD_PAYMENT"
  | "WITHDRAWAL_APPROVED"
  |  "REDIRECTING";

export type PaymentStatus = "PAID" | "PENDING" | "SUCCESS" | "FAILED";

export interface PaymentHistory {
  paymentId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  paidAt: string;
}

export interface EscrowPayment {
  id: string;
  orderId?: string;
  contractId?: string;
  contractAmount: number;
  depositPercent: number;
  // Actual money amounts from the order (not derived from a percentage).
  depositAmount: number;
  remainingBalance: number;
  currencyCode: "USD" | "KHR";
  escrowStatus: string;
  buyerName: string;
  buyerId?: string | null;
  farmerName: string;
  productName: string;
  chatRoomId?: string | null;
  qty?: string;
  approvedPaymentAmount?: number;
  paymentHistory?: PaymentHistory[];
}
