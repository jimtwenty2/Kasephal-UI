import type {
  CropProductListParams,
  CropProductPost,
  CropProductRequestBody,
} from "@/types/crop-product";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";

export const BASE_URL =
  process.env.API_BASE_URL ?? process.env.NEXT_BASE_API_URL ?? "";

export type CropProductPaginationPayload = {
  total?: number;
  totalItems?: number;
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  currentPage?: number;
  page?: number;
  size?: number;
  pageSize?: number;
};

export type CropProductListPayload = CropProductPaginationPayload & {
  content?: CropProductPost[];
  data?: CropProductPost[];
  items?: CropProductPost[];
  results?: CropProductPost[];
  pagination?: CropProductPaginationPayload;
};

export type CropProductApiResponse = {
  success?: boolean;
  message?: string;
  detail?: string;
  title?: string;
  error?: string;
  errors?: unknown;
  raw?: string;
  payload?: CropProductListPayload | CropProductPost[] | CropProductPost;
  data?: CropProductListPayload | CropProductPost[] | CropProductPost;
};

export type CropProductListPath = "/crop-products" | "/crop-products/me" | string;


function formatCropProductLocationPart(part: string) {
  return part
    .trim()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getCropProductLocationParts(location?: string) {
  return (location ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatCropProductFullLocation(
  location?: string,
  fallback = "Cambodia",
) {
  const parts = getCropProductLocationParts(location);

  if (parts.length === 0) return fallback;

  return parts.map(formatCropProductLocationPart).join(", ");
}

export function formatCropProductProvince(
  location?: string,
  fallback = "Cambodia",
) {
  const parts = getCropProductLocationParts(location);

  if (parts.length === 0) return fallback;

  return formatCropProductLocationPart(parts[parts.length - 1]);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function getStringValue(source: Record<string, unknown>, key: string) {
  const value = source[key];

  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value);
}

function getImageFileName(value: string) {
  if (!value || value === "string") return "";

  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);

    return parts[parts.length - 1] ?? "";
  } catch {
    const parts = value.split("/").filter(Boolean);

    return parts[parts.length - 1] ?? value;
  }
}

function normalizeImageFileNames(imageUrls?: string | string[]) {
  const urls = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];

  return urls
    .filter((url): url is string => typeof url === "string" && Boolean(url.trim()))
    .map(getImageFileName)
    .filter(Boolean);
}

export function isCropProductPost(value: unknown): value is CropProductPost {
  return (
    isObject(value) &&
    ("cropProductPostId" in value ||
      "cropProductId" in value ||
      "cropProduct" in value ||
      ("postId" in value && "cropId" in value))
  );
}

export function isCropProductListPayload(
  value: unknown,
): value is CropProductListPayload {
  return isObject(value);
}

function normalizeImageUrls(imageUrls?: string | string[] | null) {
  const urls = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];

  return urls
    .filter((url): url is string => typeof url === "string" && Boolean(url.trim()))
    .map(normalizeCropProductImageUrl);
}

function getProductImageUrls(product: CropProductPost) {
  const topLevelImages = normalizeImageUrls(product.imageUrls);
  const thumbnailImages = normalizeImageUrls(product.thumbnailUrl);
  const postImages = normalizeImageUrls(product.post?.images);

  if (topLevelImages.length > 0) return topLevelImages;
  if (thumbnailImages.length > 0) return thumbnailImages;

  return postImages;
}

export function normalizeCropProduct(product: CropProductPost): CropProductPost {
  const source = product as CropProductPost & Record<string, unknown>;
  const cropProduct = product.cropProduct;
  const crop = product.crop ?? cropProduct?.crop;
  const post = product.post;
  const postId = product.postId ?? post?.postId ?? product.favoritePostId ?? "";
  const cropProductPostId =
    product.cropProductPostId ??
    product.cropProductId ??
    cropProduct?.cropProductId ??
    postId;
  const cropId = product.cropId ?? crop?.cropId ?? "";
  const farmerId =
    product.farmerId ??
    product.sellerId ??
    getStringValue(source, "createdBy") ??
    getStringValue(source, "createdById") ??
    post?.createdBy;
  const cropTypeName = product.cropTypeName ?? crop?.cropTypeName;
  const cropName = product.cropName ?? crop?.cropName;
  const title = product.title ?? post?.title ?? cropName;
  const description = product.description ?? post?.description;
  const imageUrls = getProductImageUrls(product);
  const currencyCode = product.currencyCode ?? cropProduct?.currencyCode ?? "KHR";
  const pricePerUnit = Number(product.pricePerUnit ?? cropProduct?.pricePerUnit ?? 0);
  const totalQuantity = Number(
    product.totalQuantity ?? cropProduct?.totalQuantity ?? 0,
  );
  const stockLeft = Number(product.stockLeft ?? cropProduct?.stockLeft ?? 0);
  const unitType = product.unitType ?? cropProduct?.unitType ?? "KG";
  const status = product.status ?? cropProduct?.status ?? "AVAILABLE";

  return {
    ...product,
    cropProductId: product.cropProductId ?? cropProductPostId,
    cropProductPostId,
    postId,
    cropId,
    cropTypeId: product.cropTypeId ?? crop?.cropTypeId,
    cropTypeName,
    cropName,
    cropType: product.cropType ?? cropTypeName,
    unitType,
    currencyCode,
    pricePerUnit,
    totalQuantity,
    stockLeft,
    status,
    title,
    description,
    imageUrls,
    thumbnailUrl: product.thumbnailUrl ?? imageUrls[0],
    farmerId,
    sellerId: product.sellerId ?? farmerId,
    sellerName: product.sellerName ?? product.farmerName,
    sellerProfileUrl: product.sellerProfileUrl ?? product.farmerProfileUrl,
    crop: {
      ...crop,
      cropId,
      cropName,
      cropTypeId: product.cropTypeId ?? crop?.cropTypeId,
      cropTypeName,
    },
    post: {
      ...post,
      postId,
      title,
      description,
      images: imageUrls,
    },
  };
}

export function normalizeCropProducts(products: CropProductPost[]) {
  return products.map(normalizeCropProduct);
}

export function getCropProductItems(
  response: CropProductApiResponse,
): CropProductPost[] {
  const source = response.payload ?? response.data ?? response;

  if (Array.isArray(source)) return normalizeCropProducts(source);
  if (isCropProductPost(source)) return [normalizeCropProduct(source)];
  if (!isCropProductListPayload(source)) return [];

  return normalizeCropProducts(
    source.content ?? source.data ?? source.items ?? source.results ?? [],
  );
}

export function getCropProductItem(
  response: CropProductApiResponse,
): CropProductPost | null {
  const source = response.payload ?? response.data ?? response;

  if (isCropProductPost(source)) return normalizeCropProduct(source);
  if (Array.isArray(source)) {
    const product = source[0];

    return product ? normalizeCropProduct(product) : null;
  }
  if (!isCropProductListPayload(source)) return null;

  const product =
    source.content?.[0] ?? source.data?.[0] ?? source.items?.[0] ?? source.results?.[0];

  return product ? normalizeCropProduct(product) : null;
}

export function getCropProductPagination(response: CropProductApiResponse) {
  const source = response.payload ?? response.data;

  if (!isCropProductListPayload(source) || Array.isArray(source)) return undefined;
  const pagination = source.pagination ?? source;

  return {
    page: pagination.page ?? pagination.currentPage ?? pagination.pageNumber,
    size: pagination.size ?? pagination.pageSize,
    totalElements:
      pagination.totalElements ?? pagination.totalItems ?? pagination.total,
    totalPages: pagination.totalPages,
  };
}

export function buildCropProductRequestBody(
  body: FormData | object,
): CropProductRequestBody | FormData {
  if (body instanceof FormData) return body;

  const source = body as Record<string, unknown>;

  return {
    title: getStringValue(source, "title") ?? "",
    description: getStringValue(source, "description") ?? "",
    cropId: getStringValue(source, "cropId") ?? "",
    unitType: getStringValue(source, "unitType") ?? "",
    currencyCode: getStringValue(source, "currencyCode") ?? "",
    pricePerUnit: asNumber(source.pricePerUnit),
    totalQuantity: asNumber(source.totalQuantity),
    imageUrls: normalizeImageFileNames(
      source.imageUrls as string | string[] | undefined,
    ),
  };
}

export function buildCropProductListUrl(
  path: CropProductListPath,
  params: CropProductListParams,
) {
  const url = new URL(`${BASE_URL}${path}`);

  if (params.search?.trim()) url.searchParams.set("keyword", params.search.trim());
  if (params.cropType && params.cropType !== "All") {
    url.searchParams.set("cropType", params.cropType);
  }
  if (params.region && params.region !== "All") {
    url.searchParams.set("region", params.region);
  }
  if (params.status && params.status !== "All") {
    url.searchParams.set("status", params.status);
  }
  if (params.deliveryDate) {
    url.searchParams.set("deliveryDate", params.deliveryDate);
  }

  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("size", String(params.size ?? 10));

  return url;
}

function stringifyErrors(errors: CropProductApiResponse["errors"]) {
  if (!errors) return undefined;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) return errors.filter(Boolean).join(" ");
  if (!isObject(errors)) return undefined;

  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
    .filter(Boolean)
    .join(" ");
}

export function getApiErrorMessage(
  response: CropProductApiResponse,
  fallback: string,
  status?: number,
) {
  const message =
    response.message ??
    response.detail ??
    response.error ??
    response.title ??
    stringifyErrors(response.errors) ??
    response.raw ??
    fallback;

  return status ? `${message} (${status})` : message;
}

export function getErrorMessage(error: Error, fallback: string) {
  return error.message || fallback;
}

export async function readCropProductResponse(
  res: Response,
): Promise<CropProductApiResponse> {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as CropProductApiResponse;
  } catch {
    return { raw: text };
  }
}
