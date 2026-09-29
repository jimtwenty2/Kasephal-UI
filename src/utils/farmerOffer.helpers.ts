import type {
  FarmerOfferApiResponse,
  FarmerOfferItem,
  FarmerOfferListPayload,
  FarmerOfferRequestBody,
} from "@/types/farmer-offer";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

export const FARMER_OFFER_BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_BASE_API_URL ?? apiBaseUrl ?? "";

export async function readFarmerOfferResponse<T>(
  res: Response,
): Promise<FarmerOfferApiResponse<T>> {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as FarmerOfferApiResponse<T>;
  } catch {
    return { message: text };
  }
}

export function getFarmerOfferErrorMessage(
  response: FarmerOfferApiResponse,
  fallback: string,
  status: number,
) {
  return response.message ?? response.detail ?? `${fallback} (${status})`;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

function getStringValue(source: Record<string, unknown>, key: string) {
  const value = source[key];
  return typeof value === "string" ? value : "";
}

function getOptionalStringValue(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

function normalizeDate(date: string) {
  if (!date) return "";
  if (date.includes("T")) return date;
  return new Date(`${date}T15:28:01.953Z`).toISOString();
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeFarmerOfferItem(value: unknown): FarmerOfferItem | null {
  if (!isObject(value)) return null;

  const farmerOfferId =
    getStringValue(value, "farmerOfferId") ||
    getStringValue(value, "offerId") ||
    getStringValue(value, "id");

  if (!farmerOfferId) return null;

  const farmer = isObject(value.farmer) ? value.farmer : null;
  const user = isObject(value.user) ? value.user : null;
  const profile = isObject(value.profile) ? value.profile : null;

  return {
    createdAt: getStringValue(value, "createdAt"),
    cropDemandPostId:
      getStringValue(value, "cropDemandPostId") ||
      getStringValue(value, "demandId") ||
      getStringValue(value, "postId"),
    currencyCode: getStringValue(value, "currencyCode") || "KHR",
    estimatedDeliveryDate: getStringValue(value, "estimatedDeliveryDate"),
    farmerId:
      getStringValue(value, "farmerId") ||
      getStringValue(farmer ?? {}, "farmerId") ||
      getStringValue(farmer ?? {}, "userId") ||
      getStringValue(user ?? {}, "userId"),
    farmerLocation:
      getOptionalStringValue(value, [
        "farmerLocation",
        "farmLocation",
        "location",
      ]) ??
      getOptionalStringValue(farmer ?? {}, [
        "farmerLocation",
        "farmLocation",
        "location",
      ]) ??
      getOptionalStringValue(profile ?? {}, [
        "farmerLocation",
        "farmLocation",
        "location",
      ]),
    farmerName:
      getStringValue(value, "farmerName") ||
      getStringValue(farmer ?? {}, "farmerName") ||
      getStringValue(farmer ?? {}, "fullName") ||
      getStringValue(user ?? {}, "fullName") ||
      getStringValue(profile ?? {}, "fullName"),
    farmerOfferId,
    farmerProfileUrl:
      typeof value.farmerProfileUrl === "string"
        ? normalizeCropProductImageUrl(value.farmerProfileUrl)
        : typeof farmer?.farmerProfileUrl === "string"
          ? normalizeCropProductImageUrl(farmer.farmerProfileUrl)
          : typeof user?.profileUrl === "string"
            ? normalizeCropProductImageUrl(user.profileUrl)
            : typeof profile?.profileUrl === "string"
              ? normalizeCropProductImageUrl(profile.profileUrl)
        : null,
    message: getStringValue(value, "message"),
    offeredQuantity: asNumber(value.offeredQuantity),
    proposedPricePerUnit: asNumber(
      value.proposedPricePerUnit ?? value.proposedPrice,
    ),
    reviewCount: asNumber(value.reviewCount),
    trustScore: asNumber(value.trustScore),
    updatedAt: getStringValue(value, "updatedAt"),
  };
}

export function normalizeFarmerOfferListPayload(
  response: FarmerOfferApiResponse<FarmerOfferListPayload>,
): FarmerOfferListPayload {
  const payload = response.payload;
  const source = payload ?? response.data;
  const sourceRecord = isObject(source) ? source : null;
  const rawItems =
    (Array.isArray(source) && source) ||
    (Array.isArray(sourceRecord?.items) && sourceRecord.items) ||
    (Array.isArray(sourceRecord?.content) && sourceRecord.content) ||
    (Array.isArray(sourceRecord?.data) && sourceRecord.data) ||
    (Array.isArray(sourceRecord?.results) && sourceRecord.results) ||
    [];

  if (!sourceRecord && rawItems.length === 0) {
    return {
      items: [],
      pagination: { page: 1, size: 10, totalElements: 0, totalPages: 0 },
    };
  }

  return {
    ...(sourceRecord ?? {}),
    items: rawItems
      .map((item) => normalizeFarmerOfferItem(item))
      .filter((item): item is FarmerOfferItem => Boolean(item)),
    pagination: {
      page: 1,
      size: rawItems.length || 10,
      totalElements: rawItems.length,
      totalPages: 1,
      ...(sourceRecord?.pagination && isObject(sourceRecord.pagination)
        ? sourceRecord.pagination
        : {}),
    },
  };
}

export function extractFarmerOfferItem(
  response: FarmerOfferApiResponse,
): FarmerOfferItem | null {
  const source = response.payload ?? response.data;

  if (Array.isArray(source)) return normalizeFarmerOfferItem(source[0]);
  if (isObject(source) && Array.isArray(source.items)) {
    return normalizeFarmerOfferItem(source.items[0]);
  }
  if (isObject(source)) {
    for (const key of ["offer", "farmerOffer", "item", "data", "content"]) {
      const nested = source[key];
      const item = Array.isArray(nested)
        ? normalizeFarmerOfferItem(nested[0])
        : normalizeFarmerOfferItem(nested);

      if (item) return item;
    }
  }

  return normalizeFarmerOfferItem(source);
}

export function buildFarmerOfferBody(body: object): FarmerOfferRequestBody {
  const source = body as Record<string, unknown>;

  return {
    currencyCode:
      getStringValue(source, "currencyCode").toUpperCase() === "USD"
        ? "USD"
        : "KHR",
    proposedPricePerUnit: asNumber(
      source.proposedPricePerUnit ?? source.proposedPrice,
    ),
    offeredQuantity: asNumber(source.offeredQuantity),
    estimatedDeliveryDate: normalizeDate(
      getStringValue(source, "estimatedDeliveryDate") ||
        getStringValue(source, "deliveryDate"),
    ),
    message: getStringValue(source, "message"),
  };
}
