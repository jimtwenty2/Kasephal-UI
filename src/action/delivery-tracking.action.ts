"use server";

import { revalidatePath } from "next/cache";
import {
  getDeliveryTrackingService,
  updateDeliveryTrackingService,
  type DeliveryTracking,
  type DeliveryTrackingMutationResult,
} from "@/services/delivery-tracking.service";
import { getOrderByIdService, type Order } from "@/services/order.service";
import { getOrderCropName } from "@/utils/orderDisplay";
import { sendChatMessageAction } from "@/app/chat/_actions/sendChatMessageAction";
import headerToken from "@/lib/headerToken";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

export async function getDeliveryTrackingAction(
  orderId: string,
): Promise<DeliveryTracking | null> {
  return getDeliveryTrackingService(orderId);
}

export async function confirmBuyerDeliveryAction(
  orderId: string,
): Promise<DeliveryTrackingMutationResult> {
  if (!orderId) {
    return { success: false, error: "Missing order reference." };
  }

  // Re-fetch the latest tracking so we preserve the farmer's confirmation
  // (and don't rely on a possibly-stale/missing prop from the page).
  const current = await getDeliveryTrackingService(orderId);

  // PUT /tracking requires the full resource — preserve the farmer's
  // confirmation, flip the buyer confirmation, and mark the delivery confirmed.
  const result = await updateDeliveryTrackingService({
    orderId,
    isFarmerConfirmed: current?.isFarmerConfirmed ?? false,
    isBuyerConfirmed: true,
    status: "CONFIRMED",
  });

  if (result.success) {
    const messageSent = await sendDeliveryUpdateMessage(orderId, "CONFIRMED");
    if (messageSent) {
      await archiveOrderChatRoom(orderId);
    }
    revalidatePath("/delivery", "page");
    revalidateCropDemandPages();
  }

  return result;
}

export async function confirmFarmerDeliveryAction(
  orderId: string,
): Promise<DeliveryTrackingMutationResult> {
  if (!orderId) {
    return { success: false, error: "Missing order reference." };
  }

  // Re-fetch the latest tracking so we preserve the buyer's confirmation
  // (and don't rely on a possibly-stale/missing prop from the page).
  const current = await getDeliveryTrackingService(orderId);

  // PUT /tracking requires the full resource — flip the farmer confirmation,
  // preserve the buyer's, and move the delivery into transit. (The buyer can
  // only confirm receipt once the farmer has confirmed and it's in transit.)
  const result = await updateDeliveryTrackingService({
    orderId,
    isFarmerConfirmed: true,
    isBuyerConfirmed: current?.isBuyerConfirmed ?? false,
    status: "IN_TRANSIT",
  });

  if (result.success) {
    await sendDeliveryUpdateMessage(orderId, "IN_TRANSIT");
    revalidatePath("/delivery", "page");
    revalidateCropDemandPages();
  }

  return result;
}

function revalidateCropDemandPages() {
  revalidatePath("/listing-crop-demands");
  revalidatePath("/crop-demands-management");
}

async function sendDeliveryUpdateMessage(
  orderId: string,
  status: "IN_TRANSIT" | "CONFIRMED",
) {
  const order = await getOrderByIdService(orderId);
  if (!order?.chatRoomId) return false;

  const result = await sendChatMessageAction({
    chatRoomId: order.chatRoomId,
    content: buildDeliveryUpdateMessage(order, status),
  });

  return result.success;
}

async function archiveOrderChatRoom(orderId: string) {
  const order = await getOrderByIdService(orderId);
  if (!order?.chatRoomId) return;

  const headers = await headerToken();

  await fetch(`${apiBaseUrl}/chat-rooms/${order.chatRoomId}/archive`, {
    method: "PATCH",
    headers,
    cache: "no-store",
  });
}

function buildDeliveryUpdateMessage(
  order: Order,
  status: "IN_TRANSIT" | "CONFIRMED",
) {
  return [
    `DELIVERY_UPDATE:${order.orderId}`,
    `status:${status}`,
    `crop:${encodeURIComponent(getOrderCropName(order))}`,
    `chatRoomId:${encodeURIComponent(order.chatRoomId)}`,
  ].join("\n");
}
