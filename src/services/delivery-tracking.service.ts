import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";

 export type DeliveryTrackingStatus = "PENDING" | "IN_TRANSIT" | "CONFIRMED";

 export type DeliveryTracking = {
    deliveryTrackingId: string;
    isFarmerConfirmed: boolean;
    isBuyerConfirmed: boolean;
    status: DeliveryTrackingStatus;
    createdAt: string;
    updatedAt: string;
    orderId: string;
};

 export type DeliveryTrackingResponse = {
    status: number;
    message: string;
    payload: DeliveryTracking;
    success: boolean;
    timestamp: string;
};

export type DeliveryTrackingRequest = {
    orderId: string;
    isFarmerConfirmed: boolean;
    isBuyerConfirmed: boolean;
    status: DeliveryTrackingStatus;
};

export type DeliveryTrackingMutationResult = {
    success: boolean;
    error?: string;
    data?: DeliveryTracking;
};

export async function getDeliveryTrackingService(
    orderId: string,
): Promise<DeliveryTracking | null> {
    try {
        const headers = await headerToken();

        const res = await fetch(`${env.NEXT_BASE_API_URL}/tracking/${orderId}`, {
            cache: "no-store",
            headers,
        });

        const data: DeliveryTrackingResponse = await res.json();

        if (!res.ok || !data.success || !data.payload) {
            return null;
        }

        return data.payload;
    } catch (error) {
        console.error("Delivery tracking API error:", error);
        return null;
    }
}

export async function updateDeliveryTrackingService(
    body: DeliveryTrackingRequest,
): Promise<DeliveryTrackingMutationResult> {
    try {
        const headers = await headerToken();

        const res = await fetch(`${env.NEXT_BASE_API_URL}/tracking`, {
            method: "PUT",
            cache: "no-store",
            headers,
            body: JSON.stringify(body),
        });

        // Errors come back as RFC problem+json ({ title, detail, ... }),
        // success as the standard envelope ({ success, payload, message }).
        const data = (await res.json().catch(() => null)) as
            | (DeliveryTrackingResponse & {
                  detail?: string;
                  title?: string;
              })
            | null;

        if (!res.ok || !data?.success) {
            console.error("Update delivery tracking failed:", res.status, data);
            return {
                success: false,
                error:
                    data?.message ??
                    data?.detail ??
                    data?.title ??
                    `Failed to update delivery (${res.status}).`,
            };
        }

        return { success: true, data: data.payload };
    } catch (error) {
        console.error("Update delivery tracking API error:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update delivery.",
        };
    }
}
