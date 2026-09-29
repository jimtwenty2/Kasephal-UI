  import headerToken from "@/lib/headerToken";
import type {
  FarmerReview,
  FarmerReviewResponse,
  FarmerReviewsResponse,
  GetReviewResult,
  GetReviewsResult,
} from "@/types/rankingView";

const BASE_URL = process.env.NEXT_BASE_API_URL ?? "";

type ReviewRole = "farmer" | "buyer";

async function readJson<T>(
  res: Response,
): Promise<FarmerReviewsResponse<T> | null> {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as FarmerReviewsResponse<T>;
  } catch {
    return null;
  }
}

function getApiErrorMessage(
  response: FarmerReviewsResponse<unknown> | null,
  fallback: string,
  status?: number,
) {
  const message = response?.message ?? fallback;

  return status ? `${message} (${status})` : message;
}

function extractReviews(payload: unknown): FarmerReview[] {
  if (Array.isArray(payload)) return payload as FarmerReview[];

  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    const items =
      source.items ?? source.content ?? source.data ?? source.results ?? [];

    return Array.isArray(items) ? (items as FarmerReview[]) : [];
  }

  return [];
}

export async function getReviewsByUserIdService(
  userId: string,
  role: ReviewRole,
): Promise<GetReviewsResult> {
  if (!BASE_URL) {
    return { data: [], error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${BASE_URL}/reviews/users/${userId}/${role}`, {
      method: "GET",
      headers: await headerToken(),
      cache: "no-store",
    });
    const json = await readJson<FarmerReview[] | Record<string, unknown>>(res);

    if (!res.ok || json?.success === false) {
      return {
        data: [],
        error: getApiErrorMessage(
          json,
          `Failed to fetch ${role} reviews.`,
          res.status,
        ),
      };
    }

    return { data: extractReviews(json?.payload) };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error
          ? error.message
          : `Failed to fetch ${role} reviews.`,
    };
  }
}

export async function getReviewsByOrderIdService(
  orderId: string,
): Promise<GetReviewsResult> {
  if (!BASE_URL) {
    return { data: [], error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${BASE_URL}/reviews/order/${encodeURIComponent(orderId)}`, {
      method: "GET",
      headers: await headerToken(),
      cache: "no-store",
    });
    const json = await readJson<FarmerReview[] | Record<string, unknown>>(res);

    if (!res.ok || json?.success === false) {
      return {
        data: [],
        error: getApiErrorMessage(
          json,
          "Failed to fetch order reviews.",
          res.status,
        ),
      };
    }

    return { data: extractReviews(json?.payload) };
  } catch (error) {
    return {
      data: [],
      error:
        error instanceof Error ? error.message : "Failed to fetch order reviews.",
    };
  }
}

async function getReviewsByEntityService(
  path: string,
  fallback: string,
): Promise<GetReviewsResult> {
  if (!BASE_URL) {
    return { data: [], error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: await headerToken(),
      cache: "no-store",
    });
    const json = await readJson<FarmerReview[] | Record<string, unknown>>(res);

    if (!res.ok || json?.success === false) {
      return {
        data: [],
        error: getApiErrorMessage(json, fallback, res.status),
      };
    }

    return { data: extractReviews(json?.payload) };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : fallback,
    };
  }
}

export async function getReviewsByCropProductIdService(
  cropProductId: string,
  page = 0,
  size = 100,
): Promise<GetReviewsResult> {
  return getReviewsByEntityService(
    `/reviews/crop-products/${encodeURIComponent(cropProductId)}?page=${page}&size=${size}`,
    "Failed to fetch crop product reviews.",
  );
}

export async function getReviewsByPostIdService(
  postId: string,
  page = 0,
  size = 100,
): Promise<GetReviewsResult> {
  return getReviewsByEntityService(
    `/reviews/posts/${encodeURIComponent(postId)}?page=${page}&size=${size}`,
    "Failed to fetch post reviews.",
  );
}

export async function getReviewByIdService(
  reviewId: string,
): Promise<GetReviewResult> {
  if (!BASE_URL) {
    return { data: null, error: "API base URL is not configured." };
  }

  try {
    const res = await fetch(`${BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
      method: "GET",
      headers: await headerToken(),
      cache: "no-store",
    });
    const json = await readJson<FarmerReview | FarmerReviewResponse>(res);

    if (!res.ok || json?.success === false) {
      return {
        data: null,
        error: getApiErrorMessage(
          json,
          "Failed to fetch review.",
          res.status,
        ),
      };
    }

    const payload = json?.payload;

    if (payload && typeof payload === "object" && "reviewId" in payload) {
      return { data: payload as FarmerReview };
    }

    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      typeof payload.data === "object"
    ) {
      return { data: payload.data as FarmerReview };
    }

    return { data: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch review.",
    };
  }
}
