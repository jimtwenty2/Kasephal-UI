"use server";

import {
  createCropProductOrderService,
  createCropDemandOrderService,
  updateCropProductOrderService,
} from "@/services/crop-product-order.service";
import { getOrdersService } from "@/services/order.service";
import { startChatRoomAction } from "@/app/chat/_actions/startChatRoomAction";
import type {
  CropProductOrderInput,
  CreateCropDemandOrderInput,
  CreateCropProductOrderResult,
  StartCropProductChatInput,
  StartChatResult,
  UpdateCropProductOrderInput,
} from "@/types/crop-product-order.type";

type ActiveCropProductOrderChatResult =
  | {
      success: true;
      data: {
        orderId: string;
        chatRoomId: string;
      } | null;
    }
  | { success: false; error: string };

function validateCurrencyAmount(
  currencyCode: "USD" | "KHR" | undefined,
  amount: number | undefined,
  label: string,
) {
  if (currencyCode !== "KHR") return null;

  if (amount == null || !Number.isFinite(amount)) {
    return `${label} is invalid.`;
  }
  if (!Number.isInteger(amount)) {
    return `${label} in KHR cannot include decimal values.`;
  }
  if (amount < 100) {
    return `${label} in KHR must be at least 100.`;
  }
  if (label.toLowerCase().includes("price") && amount % 100 !== 0) {
    return `${label} in KHR must be divisible by 100.`;
  }

  return null;
}

// POST /chat-rooms/start — reuse the same action that works in the chat flow.
export async function startCropProductChatAction(
  input: StartCropProductChatInput,
): Promise<StartChatResult> {
  if (!input.postId) {
    return { success: false, error: "Missing post reference." };
  }
  if (!input.farmerId) {
    return { success: false, error: "Missing farmer reference." };
  }
  if (!input.message?.trim()) {
    return { success: false, error: "Opening message is required." };
  }

  const result = await startChatRoomAction({
    postId: input.postId,
    farmerId: input.farmerId,
    message: input.message,
    chatType: input.chatType,
    forceNew: input.forceNew,
  });

  if (!result.success) {
    return { success: false, error: result.error ?? "Failed to start chat room." };
  }

  const chatRoomId = result.payload?.chatRoomId;
  if (!chatRoomId) {
    console.error("[startCropProductChatAction] missing chatRoomId in payload:", result.payload);
    return { success: false, error: "Chat room ID missing from response." };
  }

  return {
    success: true,
    chatRoomId,
    reusedExistingRoom: Boolean(result.payload?.reusedExistingRoom),
  };
}

export async function getActiveCropProductOrderChatAction(input: {
  postId: string;
  farmerId: string;
}): Promise<ActiveCropProductOrderChatResult> {
  if (!input.postId) {
    return { success: false, error: "Missing post reference." };
  }
  if (!input.farmerId) {
    return { success: false, error: "Missing farmer reference." };
  }

  const orders = await getOrdersService();
  const activeOrder = orders.find(
    (order) =>
      order.post?.postId === input.postId &&
      order.farmerId === input.farmerId &&
      !order.isCompleted,
  );

  if (!activeOrder?.orderId || !activeOrder.chatRoomId) {
    return { success: true, data: null };
  }

  return {
    success: true,
    data: {
      orderId: activeOrder.orderId,
      chatRoomId: activeOrder.chatRoomId,
    },
  };
}

// POST /orders/post-product — buyer creates an order (no contract).
export async function createCropProductOrderAction(
  input: CropProductOrderInput,
): Promise<CreateCropProductOrderResult> {
  if (!input.postId) {
    return { success: false, error: "Missing post reference." };
  }
  if (!input.chatRoomId) {
    return { success: false, error: "Missing chat room reference." };
  }
  if (!input.quantity || input.quantity <= 0) {
    return { success: false, error: "Quantity must be greater than 0." };
  }
  if (!input.depositAmount || input.depositAmount <= 0) {
    return { success: false, error: "Deposit amount is invalid." };
  }
  if (!input.pricePerUnit || input.pricePerUnit <= 0) {
    return { success: false, error: "Price per unit must be greater than 0." };
  }

  const priceError = validateCurrencyAmount(
    input.currencyCode,
    input.pricePerUnit,
    "Price per unit",
  );
  if (priceError) {
    return { success: false, error: priceError };
  }

  const depositError = validateCurrencyAmount(
    input.currencyCode,
    input.depositAmount,
    "Deposit amount",
  );
  if (depositError) {
    return { success: false, error: depositError };
  }

  return createCropProductOrderService({ ...input, contractId: null });
}

// POST /orders/crop-demand — buyer creates an order from a finalized crop-demand
// contract. The contract supplies every term, so only the contract id and the
// deposit to fund are sent.
export async function createCropDemandOrderAction(
  input: CreateCropDemandOrderInput,
): Promise<CreateCropProductOrderResult> {
  if (!input.contractId) {
    return { success: false, error: "Missing contract reference." };
  }
  if (input.depositAmount == null || input.depositAmount <= 0) {
    return { success: false, error: "Deposit amount is invalid." };
  }

  const priceError = validateCurrencyAmount(
    input.currencyCode,
    input.pricePerUnit,
    "Price per unit",
  );
  if (priceError) {
    return { success: false, error: priceError };
  }

  const depositError = validateCurrencyAmount(
    input.currencyCode,
    input.depositAmount,
    "Deposit amount",
  );
  if (depositError) {
    return { success: false, error: depositError };
  }

  const { currencyCode, pricePerUnit, ...orderInput } = input;

  return createCropDemandOrderService(orderInput);
}

// PUT /orders/{id} — buyer updates a rejected order and resubmits it for farmer confirmation.
export async function updateCropProductOrderAction(
  input: UpdateCropProductOrderInput,
): Promise<CreateCropProductOrderResult> {
  if (!input.orderId) {
    return { success: false, error: "Missing order reference." };
  }
  if (!input.quantity || input.quantity <= 0) {
    return { success: false, error: "Quantity must be greater than 0." };
  }
  if (!input.pricePerUnit || input.pricePerUnit <= 0) {
    return { success: false, error: "Price per unit must be greater than 0." };
  }
  if (!input.depositAmount || input.depositAmount <= 0) {
    return { success: false, error: "Deposit amount is invalid." };
  }

  const priceError = validateCurrencyAmount(
    input.currencyCode,
    input.pricePerUnit,
    "Price per unit",
  );
  if (priceError) {
    return { success: false, error: priceError };
  }

  const depositError = validateCurrencyAmount(
    input.currencyCode,
    input.depositAmount,
    "Deposit amount",
  );
  if (depositError) {
    return { success: false, error: depositError };
  }

  return updateCropProductOrderService(input);
}
