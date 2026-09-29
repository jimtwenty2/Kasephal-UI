import type { MarketPriceCheckResponse } from "@/types/market-price";

export type CropProductOrderInput = {
  postId: string;
  chatRoomId: string;
  quantity: number;
  depositAmount: number;
  pricePerUnit: number;
  currencyCode: "USD" | "KHR";
  contractId: string | null;
};

// POST /orders/crop-demand — a demand order derives every term (quantity,
// price, currency) from its contract, so the body is only the contract id and
// the deposit to fund.
export type CreateCropDemandOrderInput = {
  contractId: string;
  depositAmount: number;
  currencyCode?: "USD" | "KHR";
  pricePerUnit?: number;
};

export type CropProductOrder = {
  orderId: string;
  quantity: number;
  unitType: string;
  currencyCode: string;
  pricePerUnit: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  isCompleted: boolean;
  escrowStatus?: "FUNDED" | "COMPLETED" | "REFUNDED" | "PENDING";
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  farmerId: string;
  chatRoomId: string;
  postId?: string;
  contractId?: string | null;
  marketPriceCheck?: MarketPriceCheckResponse | null;
};

export type CreateCropProductOrderResult = {
  success: boolean;
  error?: string;
  data?: CropProductOrder;
};

export type UpdateCropProductOrderInput = {
  orderId: string;
  quantity: number;
  pricePerUnit: number;
  depositAmount: number;
  currencyCode: "USD" | "KHR";
};

export type StartCropProductChatInput = {
  chatType: "CROP_PRODUCT";
  postId: string;
  farmerId: string;
  message: string;
  forceNew?: boolean;
};

export type StartChatResult = {
  success: boolean;
  error?: string;
  chatRoomId?: string;
  reusedExistingRoom?: boolean;
};
