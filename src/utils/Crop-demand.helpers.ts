import type {
  CropDemandApiResponse,
  CropDemandListPayload,
  CropDemandListParams,
  CropDemandPost,
  CropDemandRequestBody,
  Pagination,
} from "@/types/crop-demand";
import { apiBaseUrl } from "@/utils/apiBaseUrl";

export const BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_BASE_API_URL ?? apiBaseUrl ?? "";
const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? "https://s3.detronic11.win/uploads";

export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  size: 12,
  totalElements: 0,
  totalPages: 1,
};

export function normalizeUnitType(unitType: string): string {
  if (unitType === "TONS" || unitType === "TON") return "TON";

  return "KG";
}

export function normalizeExpectedDeliveryDate(date: string) {
  if (!date) return "";
  if (date.includes("T")) return date;

  return new Date(`${date}T15:28:01.953Z`).toISOString();
}

export function buildCropDemandRequestBody(
  body: CropDemandRequestBody,
): CropDemandRequestBody {
  return {
    ...body,
    unitType: normalizeUnitType(body.unitType),
    expectedDeliveryDate: normalizeExpectedDeliveryDate(
      body.expectedDeliveryDate,
    ),
    imageUrls: normalizeImageUrls(body.imageUrls),
  };
}

export function normalizeImageUrls(
  imageUrls: string | string[] | undefined,
): string[] {
  if (Array.isArray(imageUrls)) {
    return imageUrls
      .filter((url): url is string => typeof url === "string")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return typeof imageUrls === "string" && imageUrls.trim()
    ? [imageUrls.trim()]
    : [];
}

function toAbsoluteImageUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }

  return `${IMAGE_BASE_URL.replace(/\/$/, "")}/${url.replace(/^\/+/, "")}`;
}

export function normalizeDemand(demand: CropDemandPost): CropDemandPost {
  const source = demand as CropDemandPost & Record<string, unknown>;

  return {
    ...demand,
    buyerId:
      demand.buyerId ??
      (typeof source.userId === "string" ? source.userId : undefined) ??
      (typeof source.createdById === "string" ? source.createdById : undefined),
    cropType: demand.cropTypeName ?? demand.cropType ?? "",
    cropTypeName: demand.cropTypeName ?? demand.cropType ?? "",
    currencyCode: demand.currencyCode === "USD" ? "USD" : demand.currencyCode,
    unitType: normalizeUnitType(demand.unitType) as CropDemandPost["unitType"],
    imageUrls: normalizeImageUrls(demand.imageUrls).map(toAbsoluteImageUrl),
  };
}

type CropDemandPayload =
  | CropDemandListPayload
  | CropDemandPost[]
  | CropDemandPost
  | null
  | undefined;

function isCropDemandPost(payload: CropDemandPayload): payload is CropDemandPost {
  return (
    typeof payload === "object" &&
    payload !== null &&
    !Array.isArray(payload) &&
    "cropDemandPostId" in payload &&
    typeof payload.cropDemandPostId === "string"
  );
}

function getListFromPayload(payload: CropDemandPayload): CropDemandPost[] {
  if (Array.isArray(payload)) return payload as CropDemandPost[];
  if (!payload || isCropDemandPost(payload)) return [];

  const items =
    payload.items ??
    payload.content ??
    payload.data ??
    payload.results ??
    [];

  return Array.isArray(items) ? (items as CropDemandPost[]) : [];
}

export function extractItems(payload: CropDemandPayload): CropDemandPost[] {
  return getListFromPayload(payload).map(normalizeDemand);
}

export function extractItem(payload: CropDemandPayload): CropDemandPost | null {
  if (isCropDemandPost(payload)) return normalizeDemand(payload);

  return extractItems(payload)[0] ?? null;
}

export function extractPagination(
  payload: CropDemandPayload,
  params: CropDemandListParams,
  itemCount: number,
): Pagination {
  const size = params.size ?? DEFAULT_PAGINATION.size;
  const payloadObject =
    payload && !Array.isArray(payload) && !isCropDemandPost(payload)
      ? payload
      : {};
  const pagination = payloadObject.pagination ?? payloadObject;

  return {
    page:
      pagination.page ??
      pagination.currentPage ??
      pagination.pageNumber ??
      params.page ??
      DEFAULT_PAGINATION.page,
    size,
    totalElements:
      pagination.totalElements ??
      pagination.totalItems ??
      pagination.total ??
      itemCount,
    totalPages:
      pagination.totalPages ??
      Math.max(1, Math.ceil(itemCount / size)),
  };
}

export async function readJson(res: Response): Promise<CropDemandApiResponse> {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as CropDemandApiResponse;
  } catch {
    return {};
  }
}

export function buildListUrl(path: string, params: CropDemandListParams): URL {
  const url = new URL(`${BASE_URL}${path}`);
  const { search, cropType, region, status, page, size } = params;

  if (search?.trim()) url.searchParams.set("keyword", search.trim());
  if (cropType && cropType !== "All") url.searchParams.set("cropType", cropType);
  if (region && region !== "All") url.searchParams.set("region", region);
  if (status && status !== "All") url.searchParams.set("status", status);

  url.searchParams.set("page", String(page ?? DEFAULT_PAGINATION.page));
  url.searchParams.set("size", String(size ?? DEFAULT_PAGINATION.size));

  return url;
}

export function getErrorMessage(error: Error, fallback: string) {
  return error.message || fallback;
}

function stringifyErrors(errors: CropDemandApiResponse["errors"]) {
  if (!errors) return undefined;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) return errors.filter(Boolean).join(" ");

  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
    .filter(Boolean)
    .join(" ");
}

export function getApiErrorMessage(
  response: CropDemandApiResponse,
  fallback: string,
  status?: number,
) {
  const message =
    response.message ??
    response.detail ??
    response.error ??
    response.title ??
    stringifyErrors(response.errors) ??
    fallback;

  return status ? `${message} (${status})` : message;
}
