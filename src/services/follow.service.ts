import headerToken from "@/lib/headerToken";
import { env } from "@/lib/env";

export type FollowResponse = {
  status?: number;
  message?: string;
  detail?: string;
  title?: string;
  payload?: { isFollowing?: boolean } | null;
  success?: boolean;
  timestamp?: string;
};

// These endpoints take no request body. headerToken() sets
// "Content-Type: application/json", which makes some backends (e.g. Spring)
// expect a body and reject the bodyless request — so strip it here.
async function authHeaders(): Promise<HeadersInit> {
  const headers = new Headers(await headerToken());
  headers.delete("Content-Type");
  return headers;
}

function readError(status: number, data: FollowResponse | null, action: string) {
  return new Error(
    data?.detail ||
      data?.message ||
      data?.title ||
      `Failed to ${action} (HTTP ${status}).`,
  );
}

/**
 * Get the current follow state for a farmer.
 * GET /farmers/{farmerId}/follow-status -> { payload: { isFollowing } }
 * Fails safe to `false` so it never breaks the profile page render.
 */
export async function getFollowStatus(farmerId: string): Promise<boolean> {
  const url = `${env.NEXT_BASE_API_URL}/farmers/${farmerId}/follow-status`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: await authHeaders(),
      cache: "no-store",
    });

    const data = (await res.json().catch(() => null)) as FollowResponse | null;

    if (!res.ok || data?.success === false) {
      console.error("getFollowStatus failed:", res.status, url, data);
      return false;
    }

    return data?.payload?.isFollowing ?? false;
  } catch (error) {
    console.error("getFollowStatus error:", url, error);
    return false;
  }
}

/**
 * Follow a farmer. POST /farmers/{farmerProfileId}/follow
 * Returns the resulting follow state reported by the backend.
 */
export async function followFarmer(farmerProfileId: string): Promise<boolean> {
  const url = `${env.NEXT_BASE_API_URL}/farmers/${farmerProfileId}/follow`;

  const res = await fetch(url, {
    method: "POST",
    headers: await authHeaders(),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as FollowResponse | null;

  if (!res.ok || data?.success === false) {
    console.error("followFarmer failed:", res.status, url, data);
    throw readError(res.status, data, "follow");
  }

  return data?.payload?.isFollowing ?? true;
}

/**
 * Unfollow a farmer. DELETE /farmers/{farmerProfileId}/follow
 * Returns the resulting follow state (false when no body is returned).
 */
export async function unfollowFarmer(
  farmerProfileId: string,
): Promise<boolean> {
  const url = `${env.NEXT_BASE_API_URL}/farmers/${farmerProfileId}/follow`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: await authHeaders(),
    cache: "no-store",
  });

  if (res.status === 204) return false;

  const data = (await res.json().catch(() => null)) as FollowResponse | null;

  if (!res.ok || data?.success === false) {
    console.error("unfollowFarmer failed:", res.status, url, data);
    throw readError(res.status, data, "unfollow");
  }

  return data?.payload?.isFollowing ?? false;
}
