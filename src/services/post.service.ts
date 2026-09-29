import headerToken from "@/lib/headerToken";
import type { CropDetail } from "@/app/chat/_types/chat";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

/* =========================================================================
 * TYPES DEFINITIONS
 * ========================================================================= */

export type PostChatType = "CROP_PRODUCT" | "CROP_DEMAND" | "DIRECT";

export type PostDetailResult = {
    createdBy: string;
    crop: CropDetail;
};

type CropPostApiPayload = Record<string, unknown> & {
    crop?: Record<string, unknown>;
    post?: Record<string, unknown>;
};

/* =========================================================================
 * HELPER FUNCTIONS
 * ========================================================================= */

/** Shared authenticated GET that returns the `payload` of a standard API envelope. */
export async function apiGet<T>(url: string): Promise<T | null> {
    try {
        const headers = await headerToken();

        const res = await fetch(url, {
            cache: "no-store",
            headers,
        });

        if (!res.ok) return null;

        const data = await res.json();
        return data.payload;
    } catch {
        return null;
    }
}

function firstRecord(value: unknown): Record<string, unknown> | null {
    return Array.isArray(value) && value[0] && typeof value[0] === "object"
        ? (value[0] as Record<string, unknown>)
        : null;
}

function firstString(value: unknown): string | null {
    return Array.isArray(value) && typeof value[0] === "string"
        ? value[0]
        : null;
}

function asString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
}

function asDisplayValue(value: unknown): string | number | undefined {
    return typeof value === "string" || typeof value === "number"
        ? value
        : undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function formatCropPrice(price: unknown, currencyCode: unknown, unitType: string) {
    if (price == null) return "-";

    const symbol = currencyCode === "KHR" ? "KHR " : "$";
    const suffix = unitType ? ` / ${unitType}` : "";

    return `${symbol}${price}${suffix}`;
}

/* =========================================================================
 * MAIN SERVICE FUNCTIONS
 * ========================================================================= */

export async function getCropDetailByPostId(
    postId: string,
    chatType: PostChatType
): Promise<PostDetailResult | undefined> {
    if (chatType === "DIRECT") return undefined;

    const base =
        chatType === "CROP_PRODUCT" ? "crop-products" : "crop-demands";

    let payload =
        (await apiGet<CropPostApiPayload>(`${apiBaseUrl}/${base}/post/${postId}`)) ??
        (await apiGet<CropPostApiPayload>(`${apiBaseUrl}/${base}/${postId}`));

    if (!payload) {
        const listData = await apiGet<{ items: CropPostApiPayload[] }>(
            `${apiBaseUrl}/${base}?page=1&size=100`
        );

        payload =
            listData?.items.find(
                (item) =>
                    item.postId === postId ||
                    item.cropProductPostId === postId ||
                    item.cropDemandPostId === postId
            ) ?? null;
    }

    if (!payload) return undefined;

    const cropProduct = isObject(payload.cropProduct)
        ? payload.cropProduct
        : undefined;
    const imageRecord = firstRecord(payload.imageUrls) ?? firstRecord(payload.images);
    const imageUrl =
        firstString(payload.imageUrls) ??
        firstString(payload.post?.images) ??
        firstString(payload.images) ??
        asString(imageRecord?.url) ??
        asString(imageRecord?.imageUrl) ??
        asString(imageRecord?.fileUrl) ??
        null;

    const cropName =
        asString(payload.cropName) ??
        asString(payload.title) ??
        asString(payload.crop?.cropName) ??
        "Unknown Crop";

    const quantityValue =
        asDisplayValue(payload.totalQuantity) ??
        asDisplayValue(payload.quantityNeeded) ??
        asDisplayValue(payload.stockLeft) ??
        "-";

    const unitType = String(asString(payload.unitType) ?? cropProduct?.unitType ?? "");

    const status =
        payload.status === "AVAILABLE"
            ? "AVAILABLE"
            : payload.status === "OPEN"
                ? "OPEN"
                : payload.status === "MATCHED"
                    ? "MATCHED"
                    : asString(payload.status) ?? "-";

    const price =
        asDisplayValue(payload.pricePerUnit) ??
        cropProduct?.pricePerUnit ??
        asDisplayValue(payload.maxPricePerUnit) ??
        asDisplayValue(payload.currentPrice) ??
        null;
    const currencyCode = String(payload.currencyCode ?? cropProduct?.currencyCode ?? "USD");

    return {
        createdBy: asString(payload.createdBy) ?? "",
        crop: {
            cropName,
            quantity: `${quantityValue} ${unitType}`,
            status,
            estimatedPrice: formatCropPrice(price, currencyCode, unitType),
            currencyCode,
            pricePerUnit: typeof price === "number" ? price : Number(price),
            imageUrl,
            category:
                asString(payload.cropTypeName) ??
                asString(payload.cropType) ??
                asString(payload.crop?.cropTypeName) ??
                "CROP",
            location:
                asString(payload.location) ??
                asString(payload.locationPreferences) ??
                "Cambodia",
            unitType,
        },
    };
}

/**
 * Looks up crop detail when the caller doesn't know the post's chat type
 * (e.g. from a contract, which only carries a postId). Tries the crop-product
 * post first, then falls back to a crop-demand post.
 */
export async function getCropDetailByPostIdAnyType(
    postId: string
): Promise<PostDetailResult | undefined> {
    const asProduct = await getCropDetailByPostId(postId, "CROP_PRODUCT");
    if (asProduct) return asProduct;

    return getCropDetailByPostId(postId, "CROP_DEMAND");
}
