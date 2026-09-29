import headerToken from "@/lib/headerToken";
import type {
  CropProductListParams,
  CropProductMutationResult,
  CropProductPost,
  GetCropProductResult,
  GetCropProductsResult,
} from "@/types/crop-product";
import {
  BASE_URL,
  buildCropProductListUrl,
  buildCropProductRequestBody,
  getApiErrorMessage,
  getCropProductItem,
  getCropProductItems,
  getCropProductPagination,
  getErrorMessage,
  readCropProductResponse,
} from "@/utils/cropProduct.helpers";

const DEFAULT_LIST_RESULT: GetCropProductsResult = {
  data: [],
  pagination: {
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 1,
  },
};

function missingBaseUrlList(): GetCropProductsResult {
  return {
    ...DEFAULT_LIST_RESULT,
    error: "API base URL is not configured.",
  };
}

function missingBaseUrlItem(): GetCropProductResult {
  return { data: null, error: "API base URL is not configured." };
}

async function getJsonHeaders() {
  return headerToken();
}

async function getFormHeaders() {
  const headers = new Headers(await headerToken());

  headers.delete("Content-Type");

  return headers;
}

function hasApiBaseUrl() {
  return Boolean(BASE_URL);
}

function getProductOwnerTokens(product: CropProductPost) {
  const source = product as CropProductPost & Record<string, unknown>;
  const post = product.post as Record<string, unknown> | undefined;

  return {
    ids: [
      source.userId,
      source.farmerId,
      source.sellerId,
      source.createdBy,
      source.createdById,
      post?.createdBy,
    ].map((value) => String(value ?? "").toLowerCase()),
    names: [product.farmerName, product.sellerName, post?.createdBy].map(
      (value) => String(value ?? "").toLowerCase(),
    ),
  };
}

function matchesUserProfile(
  product: CropProductPost,
  userId: string,
  aliases: string[] = [],
) {
  const { ids, names } = getProductOwnerTokens(product);
  const normalizedUserId = userId.toLowerCase();
  const normalizedAliases = aliases
    .map((alias) => alias.trim().toLowerCase())
    .filter(Boolean);

  return (
    ids.includes(normalizedUserId) ||
    normalizedAliases.some((alias) => names.includes(alias))
  );
}

async function fetchCropProductList(
  path: string,
  params: CropProductListParams = {},
): Promise<GetCropProductsResult> {
  if (!hasApiBaseUrl()) return missingBaseUrlList();

  try {
    const res = await fetch(buildCropProductListUrl(path, params), {
      method: "GET",
      headers: await getJsonHeaders(),
      next: { tags: ["crop-products"] },
    });
    const json = await readCropProductResponse(res);

    if (!res.ok || json.success === false) {
      return {
        ...DEFAULT_LIST_RESULT,
        error: getApiErrorMessage(json, "Failed to fetch crop products.", res.status),
      };
    }

    const data = getCropProductItems(json);

    return {
      data,
      pagination: getCropProductPagination(json) ?? {
        ...DEFAULT_LIST_RESULT.pagination,
        page: params.page ?? 1,
        size: params.size ?? 10,
        totalElements: data.length,
      },
    };
  } catch (error) {
    return {
      ...DEFAULT_LIST_RESULT,
      error:
        error instanceof Error
          ? getErrorMessage(error, "Failed to fetch crop products.")
          : "Failed to fetch crop products.",
    };
  }
}

async function fetchCropProductItem(
  path: string,
  tag: string,
  fallback: string,
): Promise<GetCropProductResult> {
  if (!hasApiBaseUrl()) return missingBaseUrlItem();

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: await getJsonHeaders(),
      cache: "no-store",
    });
    const json = await readCropProductResponse(res);

    if (!res.ok || json.success === false) {
      return {
        data: null,
        error: getApiErrorMessage(json, fallback, res.status),
      };
    }

    return { data: getCropProductItem(json) };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? getErrorMessage(error, fallback) : fallback,
    };
  }
}

async function mutateCropProduct(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body: BodyInit | null,
  fallback: string,
  useFormHeaders = false,
): Promise<CropProductMutationResult> {
  if (!hasApiBaseUrl()) {
    return { success: false, error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: useFormHeaders ? await getFormHeaders() : await getJsonHeaders(),
      body,
    });
    const json = await readCropProductResponse(res);

    if (!res.ok || json.success === false) {
      return {
        success: false,
        error: getApiErrorMessage(json, fallback, res.status),
      };
    }

    return { success: true, data: getCropProductItem(json) };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? getErrorMessage(error, fallback) : fallback,
    };
  }
}

export function getCropProducts(
  page = 1,
  size = 10,
  filters: Omit<CropProductListParams, "page" | "size"> = {},
) {
  return fetchCropProductList("/crop-products", { ...filters, page, size });
}

export function getOwnCropProducts(
  page = 1,
  size = 10,
  filters: Omit<CropProductListParams, "page" | "size"> = {},
) {
  return fetchCropProductList("/crop-products/me", { ...filters, page, size });
}

async function fetchCropProductsByUserEndpoint(
  path: string,
  page: number,
  size: number,
): Promise<GetCropProductsResult | null> {
  const result = await fetchCropProductList(path, { page, size });

  return result.error ? null : result;
}

export async function getCropProductsByUserId(
  userId: string,
  page = 1,
  size = 100,
  aliases: string[] = [],
): Promise<GetCropProductsResult> {
  const encodedUserId = encodeURIComponent(userId);
  const endpointResult =
    (await fetchCropProductsByUserEndpoint(
      `/crop-products/users/${encodedUserId}`,
      page,
      size,
    )) ??
    (await fetchCropProductsByUserEndpoint(
      `/users/${encodedUserId}/crop-products`,
      page,
      size,
    ));

  if (endpointResult) return endpointResult;

  const result = await getCropProducts(page, size);

  if (result.error) return result;

  return {
    ...result,
    data: result.data.filter((product) =>
      matchesUserProfile(product, userId, aliases),
    ),
  };
}

export function getCropProductById(
  cropProductId: string,
): Promise<GetCropProductResult> {
  return fetchCropProductItem(
    `/crop-products/${cropProductId}`,
    `crop-product-${cropProductId}`,
    "Failed to fetch crop product.",
  );
}

export function getCropProductByPostId(
  postId: string,
): Promise<GetCropProductResult> {
  return fetchCropProductItem(
    `/crop-products/post/${postId}`,
    `crop-product-post-${postId}`,
    "Failed to fetch crop product by post.",
  );
}

export function createCropProduct(
  body: FormData | object,
): Promise<CropProductMutationResult> {
  const requestBody = buildCropProductRequestBody(body);
  const isFormData = requestBody instanceof FormData;

  return mutateCropProduct(
    "/crop-products",
    "POST",
    isFormData ? requestBody : JSON.stringify(requestBody),
    "Failed to create crop product.",
    isFormData,
  );
}

export function updateCropProduct(
  cropProductId: string,
  body: FormData | object,
): Promise<CropProductMutationResult> {
  const requestBody = buildCropProductRequestBody(body);
  const isFormData = requestBody instanceof FormData;

  return mutateCropProduct(
    `/crop-products/${cropProductId}`,
    "PUT",
    isFormData ? requestBody : JSON.stringify(requestBody),
    "Failed to update crop product.",
    isFormData,
  );
}

export function updateCropProductQuantity(
  cropProductId: string,
  quantity: number,
): Promise<CropProductMutationResult> {
  return mutateCropProduct(
    `/crop-products/${cropProductId}/quantity`,
    "PATCH",
    JSON.stringify({ quantity }),
    "Failed to update crop product quantity.",
  );
}

export function deleteCropProduct(
  cropProductId: string,
): Promise<CropProductMutationResult> {
  return mutateCropProduct(
    `/crop-products/${cropProductId}`,
    "DELETE",
    null,
    "Failed to delete crop product.",
  );
}
