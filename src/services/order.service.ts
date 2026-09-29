import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";

export type CropProduct = {
    cropProductId: string;
    unitType: string;
    currencyCode: string;
    pricePerUnit: number;
    totalQuantity: number;
    stockLeft: number;
    status: string;
    crop: {
        cropId: string;
        cropName: string;
        cropTypeId: string;
        cropTypeName: string;
    };
};

export type CropDemand = {
    cropName?: string | null;
    cropTypeName?: string | null;
    cropType?: string | null;
    currencyCode?: string | null;
};

export type OrderPost = {
    postId: string;
    postType: string;
    title: string;
    description: string;
    createdBy: string;
    images: string[];
    cropProduct?: CropProduct;
    cropDemand?: CropDemand;
    cropDemandPost?: CropDemand;
};

export type Order = {
    orderId: string;
    quantity: number;
    unitType: string;
    currencyCode: string;
    pricePerUnit: number;
    totalAmount: number;
    depositAmount: number;
    remainingAmount: number;
    isCompleted: boolean;
    isAccept?: boolean;

    escrowStatus?: "FUNDED" | "COMPLETED" | "REFUNDED" | "PENDING" |"PARTIALLY_RELEASED";
    escrowFunded?: number;
    escrowReleased?: number;
    escrowRefunded?: number;
    escrowBalance?: number;

    createdAt: string;
    updatedAt: string;

    post?: OrderPost;

    buyerId: string;
    farmerId: string;
    chatRoomId: string;
    contractId?: string;
    paymentStatus?: "PENDING" | "PAID" | "SUCCESS" | "FAILED" | string;
    payment?: {
        status?: string;
    } | null;
    payments?: {
        status?: string;
    }[];

    buyerName?: string;
    
    farmerName?: string;
    buyerProfileUrl?: string;
    farmerProfileUrl?: string;
    cropName: string;
    cropType: string;
    imageUrls: string[];
};

export type OrdersResponse = {
    status: number;
    message: string;
    payload: Order[];
    success: boolean;
    timestamp: string;
};

export type OrderDetailResponse = {
    status: number;
    message: string;
    payload: Order;
    success: boolean;
    timestamp: string;
};

function normalizeOrder(order: Order): Order {
    const cropProduct = order.post?.cropProduct;
    const cropDemand = order.post?.cropDemand ?? order.post?.cropDemandPost;
    const paidPaymentStatus = order.payments?.find((payment) =>
        ["PAID", "SUCCESS"].includes(String(payment.status).toUpperCase()),
    )?.status;
    const paymentStatus =
        paidPaymentStatus ??
        order.paymentStatus ??
        order.payment?.status ??
        order.payments?.[0]?.status;

    return {
        ...order,
        currencyCode:
            order.currencyCode ??
            cropProduct?.currencyCode ??
            cropDemand?.currencyCode ??
            "USD",
        cropName:
            cropProduct?.crop?.cropName ??
            cropDemand?.cropName ??
            order.cropName ??
            "Fresh Crop",
        cropType:
            cropProduct?.crop?.cropTypeName ??
            cropDemand?.cropTypeName ??
            cropDemand?.cropType ??
            order.cropType ??
            "-",
        // Resolve via the app-wide canonical resolver (same as crop products /
        // dashboard) so `uploads/...` S3 keys aren't double-prefixed.
        imageUrls: (order.post?.images ?? order.imageUrls ?? []).map(
            normalizeCropProductImageUrl,
        ),
        paymentStatus,
    };
}
export async function getOrdersService(): Promise<Order[]> {
    try {
        const headers = await headerToken();

        // The order-history table paginates client-side, so fetch a large page
        // instead of the backend's small default (which capped the table at one
        // page). Mirrors the page=1&size=100 convention used by the other list
        // services (chat, posts, market-price, official-document).
        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/orders?page=1&size=100`,
            {
                cache: "no-store",
                headers,
            },
        );

        const data: OrdersResponse = await res.json();

        if (!res.ok || !data.success) {
            return [];
        }

        return (data.payload ?? []).map(normalizeOrder);
    } catch {
        return [];
    }
}

// Find the current buyer's existing order for a given contract, if any. A buyer
// can only place one order per finalized crop-demand contract, so this lets the
// order form redirect to the existing order instead of failing on a duplicate.
export async function getOrderByContractIdService(
    contractId: string,
): Promise<Order | null> {
    if (!contractId) return null;

    const orders = await getOrdersService();
    return orders.find((order) => order.contractId === contractId) ?? null;
}

export async function getOrderByIdService(id: string): Promise<Order | null> {
    try {
        const headers = await headerToken();

        const res = await fetch(`${env.NEXT_BASE_API_URL}/orders/${id}`, {
            cache: "no-store",
            headers,
        });

        const data: OrderDetailResponse = await res.json();

        if (!res.ok || !data.success || !data.payload) {
            console.error(
                `Order detail API error: GET /orders/${id} -> HTTP ${res.status}`,
                data,
            );
            return null;
        }

        return normalizeOrder(data.payload);
    } catch (error) {
        console.error("Order detail API error:", error);
        return null;
    }
}

// TEMP DEBUG: returns the raw status + body so we can see exactly why the
// detail endpoint fails for a given id. Remove once diagnosed.
export async function debugGetOrderById(id: string) {
    const url = `${env.NEXT_BASE_API_URL}/orders/${id}`;
    try {
        const headers = await headerToken();
        const hasToken = Boolean(
            (headers as Record<string, string>).Authorization,
        );
        const res = await fetch(url, { cache: "no-store", headers });
        const text = await res.text();
        return { url, hasToken, status: res.status, ok: res.ok, body: text };
    } catch (error) {
        return { url, error: String(error) };
    }
}

export type AcceptOrderResult =
  | { success: true; data: Order }
  | { success: false; error: string };

// PATCH /orders/{id}/accept - farmer accepts a buyer's order
export async function acceptOrderService(
  orderId: string,
): Promise<AcceptOrderResult> {
  try {
    const headers = await headerToken();
    const res = await fetch(
      `${env.NEXT_BASE_API_URL}/orders/${orderId}/accept`,
      { method: "PATCH", cache: "no-store", headers },
    );
    const data: OrderDetailResponse = await res.json().catch(() => null);
    if (!res.ok || !data?.success || !data.payload) {
      return {
        success: false,
        error: (data as { message?: string })?.message ?? `Failed to accept order (${res.status}).`,
      };
    }
    return { success: true, data: normalizeOrder(data.payload) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept order.",
    };
  }
}

// PATCH /orders/{id}/reject - farmer rejects a buyer's order
export async function rejectOrderService(
  orderId: string,
): Promise<AcceptOrderResult> {
  try {
    const headers = await headerToken();
    const res = await fetch(
      `${env.NEXT_BASE_API_URL}/orders/${orderId}/reject`,
      { method: "PATCH", cache: "no-store", headers },
    );
    const data: OrderDetailResponse = await res.json().catch(() => null);
    if (!res.ok || !data?.success || !data.payload) {
      return {
        success: false,
        error: (data as { message?: string })?.message ?? `Failed to reject order (${res.status}).`,
      };
    }
    return { success: true, data: normalizeOrder(data.payload) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject order.",
    };
  }
}

export type MonthlyOrder = {
    month: string;
    count: number;
    value: number;
};

export function groupOrdersByMonth(orders: Order[]): MonthlyOrder[] {
    const monthMap: Record<string, number> = {};

    for (let i = 1; i <= 12; i++) {
        monthMap[String(i).padStart(2, "0")] = 0;
    }

    orders.forEach((order) => {
        if (!order.createdAt) return;

        const date = new Date(order.createdAt);

        if (Number.isNaN(date.getTime())) return;

        const month = String(date.getMonth() + 1).padStart(2, "0");

        monthMap[month] += 1;
    });

    const maxCount = Math.max(...Object.values(monthMap), 1);

    return Object.entries(monthMap).map(([month, count]) => ({
        month,
        count,
        value: count > 0 ? Math.round((count / maxCount) * 100) : 0,
    }));
}
