import type { EscrowPayment } from "../_types/payment";

export const mockEscrowPayment: EscrowPayment = {
  id: "6df84669eb55",
  contractId: "6df84669eb55",
  contractAmount: 25000,
  depositPercent: 30,
  depositAmount: 7500,
  remainingBalance: 17500,
  currencyCode: "USD",
  escrowStatus: "Awaiting",
  buyerName: "Ministry of Agriculture",
  farmerName: "Sokhem Reth",
  productName: "Premium Jasmine Rice (50 Tons)",
  qty: "50 Tons",
  paymentHistory: [
    {
      paymentId: "#PAY-9938",
      amount: 7500,
      status: "PENDING",
      method: "KHQR",
      paidAt: "Oct 12, 2023",
    },
    {
      paymentId: "#PAY-2939",
      amount: 17500,
      status: "PENDING",
      method: "-",
      paidAt: "-",
    },
  ],
};
