import headerToken from "@/lib/headerToken";
import type { CropDemandPost } from "@/types/crop-demand";
import type { CropProductPost } from "@/types/crop-product";
import { normalizeCropProducts } from "@/utils/cropProduct.helpers";

type PaginationPayload = {
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

type FavoriteCropDemandPayload = {
  items?: CropDemandPost[];
  pagination?: PaginationPayload;
};

type FavoriteCropProductPayload = {
  items?: CropProductPost[];
  pagination?: PaginationPayload;
};

type ApiResponse<T = unknown> = {
  success?: boolean;
  status?: number;
  message?: string;
  payload?: T;
  data?: T;
  detail?: string;
};

export type FavoriteMutationResult = {
  success: boolean;
  error?: string;
  data?: unknown;
};

export type FavoriteCropDemandsResult = {
  data: CropDemandPost[];
  error?: string;
  pagination?: PaginationPayload;
};

export type FavoriteCropProductsResult = {
  data: CropProductPost[];
  error?: string;
  pagination?: PaginationPayload;
};

function getBaseUrl() {
  return process.env.API_BASE_URL ?? process.env.NEXT_BASE_API_URL ?? null;
}

async function readResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const text = await res.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    return { message: text };
  }
}

function getError(response: ApiResponse, fallback: string, status: number) {
  return response.message ?? response.detail ?? `${fallback} (${status})`;
}

export async function getFavoriteCropDemands(
  page = 1,
  size = 10,
): Promise<FavoriteCropDemandsResult> {
  const baseUrl = getBaseUrl();
  const headers = await headerToken();

  if (!baseUrl) return { data: [], error: "API base URL is not configured." };

  const url = new URL(`${baseUrl}/favorites/crop-demands`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    const response = await readResponse<FavoriteCropDemandPayload>(res);

    if (!res.ok || response.success === false) {
      return {
        data: [],
        error: getError(
          response,
          "Failed to fetch favorite crop demands.",
          res.status,
        ),
      };
    }

    const payload = response.payload ?? response.data;

    return {
      data: (payload?.items ?? []).map((item) => ({
        ...item,
        isSaved: true,
      })),
      pagination: payload?.pagination,
    };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch favorite crop demands.",
    };
  }
}

export async function getFavoriteCropProducts(
  page = 1,
  size = 10,
): Promise<FavoriteCropProductsResult> {
  const baseUrl = getBaseUrl();
  const headers = await headerToken();

  if (!baseUrl) return { data: [], error: "API base URL is not configured." };

  const url = new URL(`${baseUrl}/favorites/crop-products`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(size));

  try {
    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    const response = await readResponse<FavoriteCropProductPayload>(res);

    if (!res.ok || response.success === false) {
      return {
        data: [],
        error: getError(
          response,
          "Failed to fetch favorite crop products.",
          res.status,
        ),
      };
    }

    const payload = response.payload ?? response.data;

    return {
      data: normalizeCropProducts(payload?.items ?? []).map((item) => ({
        ...item,
        isSaved: true,
      })),
      pagination: payload?.pagination,
    };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch favorite crop products.",
    };
  }
}

export async function addFavorite(
  postId: string,
): Promise<FavoriteMutationResult> {
  const baseUrl = getBaseUrl();

  if (!baseUrl)
    return { success: false, error: "API base URL is not configured." };

  try {
    const res = await fetch(`${baseUrl}/favorites/${postId}`, {
      method: "POST",
      headers: await headerToken(),
    });
    const response = await readResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        error: getError(response, "Failed to add favorite.", res.status),
      };
    }

    return { success: true, data: response.payload ?? response.data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add favorite.",
    };
  }
}

export async function deleteFavorite(
  postId: string,
): Promise<FavoriteMutationResult> {
  const baseUrl = getBaseUrl();

  if (!baseUrl)
    return { success: false, error: "API base URL is not configured." };

  try {
    const res = await fetch(`${baseUrl}/favorites/${postId}`, {
      method: "DELETE",
      headers: await headerToken(),
    });
    const response = await readResponse(res);

    if (!res.ok || response.success === false) {
      return {
        success: false,
        error: getError(response, "Failed to remove favorite.", res.status),
      };
    }

    return { success: true, data: response.payload ?? response.data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to remove favorite.",
    };
  }
}
