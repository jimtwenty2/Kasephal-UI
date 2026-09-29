import type { Order } from "@/services/order.service";

// A CROP_DEMAND order stores its crop + currency under the post's demand object,
// while a product order uses post.cropProduct. The shared normalizeOrder() only
// reads cropProduct, so demand (and other non-product) orders fall back to
// "Fresh Crop"/"USD". These read-only helpers re-derive the real values from
// whichever post shape exists — no change to order.service.ts / normalizeOrder.
//
// The demand object's key isn't consistent across endpoints: the list endpoint
// nests it as `cropDemand`, while the detail endpoint uses `cropDemandPost`
// (matching the `cropDemandPost*` naming used everywhere else in the app), so we
// read both — otherwise the detail page misses the currency and shows "$".
type OrderCropDemand = {
    cropName?: string | null;
    cropTypeName?: string | null;
    currencyCode?: string | null;
};

function getCropDemand(order: Order): OrderCropDemand | undefined {
    const post = order.post as
        | { cropDemand?: OrderCropDemand; cropDemandPost?: OrderCropDemand }
        | undefined;
    return post?.cropDemand ?? post?.cropDemandPost;
}

export function getOrderCropName(order: Order): string {
    return (
        order.post?.cropProduct?.crop?.cropName ||
        getCropDemand(order)?.cropName ||
        order.cropName ||
        "Fresh Crop"
    );
}

export function getOrderCropType(order: Order): string {
    return (
        order.post?.cropProduct?.crop?.cropTypeName ||
        getCropDemand(order)?.cropTypeName ||
        order.cropType ||
        "—"
    );
}

export function getOrderCurrencyCode(order: Order): string {
    return (
        order.currencyCode ||
        order.post?.cropProduct?.currencyCode ||
        getCropDemand(order)?.currencyCode ||
        "USD"
    );
}
