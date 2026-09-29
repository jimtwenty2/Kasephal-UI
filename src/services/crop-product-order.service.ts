import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import type {
  CropProductOrder,
  CropProductOrderInput,
  CreateCropDemandOrderInput,
  CreateCropProductOrderResult,
  StartCropProductChatInput,
  StartChatResult,
  UpdateCropProductOrderInput,
} from "@/types/crop-product-order.type";

type ApiEnvelope<T> = {
  status: number;
  message: string;
  payload: T;
  success: boolean;
  timestamp: string;
  detail?: string;
  title?: string;
};

// POST /chat-rooms/start — open (or reuse) a chat room for a crop product post.
export async function startCropProductChatService(
  input: StartCropProductChatInput,
): Promise<StartChatResult> {
  try {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}/chat-rooms/start`, {
      method: "POST",
      cache: "no-store",
      headers,
      body: JSON.stringify(input),
    });

    const data = (await res.json().catch(() => null)) as
      | (ApiEnvelope<{ chatRoomId: string; reusedExistingRoom?: boolean | null }> & { detail?: string })
      | null;

    if (!res.ok || !data?.success) {
      return {
        success: false,
        error:
          data?.message ??
          data?.detail ??
          data?.title ??
          `Failed to start chat (${res.status}).`,
      };
    }

    const chatRoomId =
      data.payload?.chatRoomId ?? (data.payload as unknown as string);

    if (!chatRoomId) {
      return { success: false, error: "Chat room ID missing from response." };
    }

    return {
      success: true,
      chatRoomId,
      reusedExistingRoom: Boolean(data.payload?.reusedExistingRoom),
    };
  } catch (error) {
    console.error("Start chat API error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to start chat room.",
    };
  }
}

// POST /orders/post-product — create an order for a crop product (no contract).
export async function createCropProductOrderService(
  input: CropProductOrderInput,
): Promise<CreateCropProductOrderResult> {
  return createOrderService("/orders/post-product", input);
}

// POST /orders/crop-demand — create an order from a finalized crop-demand
// contract. The contract owns every term, so the body is just the contract id
// and the deposit to fund; the response carries the created order (orderId).
export async function createCropDemandOrderService(
  input: CreateCropDemandOrderInput,
): Promise<CreateCropProductOrderResult> {
  return createOrderService("/orders/crop-demand", input);
}

// PUT /orders/{id} — buyer revises a rejected/pending crop-product order.
// The backend resets farmer decision to pending after a successful update.
export async function updateCropProductOrderService(
  input: UpdateCropProductOrderInput,
): Promise<CreateCropProductOrderResult> {
  const { orderId, ...body } = input;
  return createOrderService(`/orders/${orderId}`, body, "PUT");
}

async function createOrderService(
  path: string,
  input:
    | CropProductOrderInput
    | CreateCropDemandOrderInput
    | Omit<UpdateCropProductOrderInput, "orderId">,
  method: "POST" | "PUT" = "POST",
): Promise<CreateCropProductOrderResult> {
  try {
    const headers = await headerToken();

    const res = await fetch(`${env.NEXT_BASE_API_URL}${path}`, {
      method,
      cache: "no-store",
      headers,
      body: JSON.stringify(input),
    });

    const data = (await res.json().catch(() => null)) as
      | (ApiEnvelope<CropProductOrder> & { detail?: string })
      | null;

    if (!res.ok || !data?.success || !data.payload) {
      return {
        success: false,
        error:
          data?.message ??
          data?.detail ??
          data?.title ??
          `Failed to create order (${res.status}).`,
      };
    }

    return { success: true, data: data.payload };
  } catch (error) {
    console.error("Create order API error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create order.",
    };
  }
}
