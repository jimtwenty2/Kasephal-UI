import { auth } from "@/auth";
import { env } from "@/lib/env";
import headerToken from "@/lib/headerToken";
import { getSession } from "next-auth/react";
import type {
  ApiResponse,
  BuyerProfileUpdate,
  FarmerProfileUpdate,
  GovernmentProfileUpdate,
} from "@/types/updateOwnProfileInfo";
import type {
  UserProfile,
  ChangePasswordPayload,
  ChangePasswordResponse,
  UpdateBakongPayload,
} from "@/types/user";
import { UpdateBakongResponse } from "@/types/updateBakong";

export type { UserProfile, ChangePasswordPayload, ChangePasswordResponse, UpdateBakongPayload };

export type FarmerSearchResult = {
  farmerId: string;
  farmerName: string;
  farmLocation: string;
  farmerUrl: string | null;
};

type UnknownRecord = Record<string, unknown>;

type ApiErrorBody = {
  message?: string;
  detail?: string;
  error?: string;
  title?: string;
  errors?: string | string[] | Record<string, string | string[] | undefined>;
};

// ─── Get Profile (Server-side) ─────────────────────────────────────────────
export async function getCurrentUserProfileServerService() {
  const session = await auth();
  if (!session?.user?.accessToken) throw new Error("User is not authenticated");

  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/me`, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch current server user profile");

  return (await res.json()) as ApiResponse<UserProfile>;
}

// ─── Get Profile (Client-side) ─────────────────────────────────────────────
export async function getCurrentUserProfileService(): Promise<UserProfile | null> {
  try {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;
    if (!accessToken) return null;

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/profile/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.payload ?? null;
  } catch {
    return null;
  }
}

// ─── Get Profile By Id ────────────────────────────────────────────────────────
function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringifyApiErrors(errors: ApiErrorBody["errors"]) {
  if (!errors) return undefined;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) return errors.filter(Boolean).join(" ");

  return Object.values(errors)
    .flatMap((value) => (Array.isArray(value) ? value : value ? [value] : []))
    .filter(Boolean)
    .join(" ");
}

function extractApiErrorMessage(body: unknown, fallback: string) {
  if (typeof body === "string") return body.trim() || fallback;
  if (!isRecord(body)) return fallback;

  const data = body as ApiErrorBody;
  return (
    data.message?.trim() ||
    data.detail?.trim() ||
    data.error?.trim() ||
    stringifyApiErrors(data.errors) ||
    data.title?.trim() ||
    fallback
  );
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getString(source: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return "";
}

function getItemsFromPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (!isRecord(payload)) return [];

  for (const key of ["content", "data", "items", "users"]) {
    const value = payload[key];

    if (Array.isArray(value)) return value;
  }

  return [];
}

function normalizeFarmerSearchResult(value: unknown): FarmerSearchResult | null {
  if (!isRecord(value)) return null;

  const basicInfo = isRecord(value.basicInfo) ? value.basicInfo : {};
  const personalInfo = isRecord(value.personalInfo) ? value.personalInfo : {};
  const farmerId =
    getString(value, ["farmerId", "farmer_id", "userId", "id", "user_id"]) ||
    getString(basicInfo, ["userId", "id"]);

  if (!farmerId) return null;

  const farmerName =
    getString(value, [
      "farmerName",
      "farmer_name",
      "fullName",
      "full_name",
      "farmerFullName",
      "name",
      "userName",
      "username",
      "displayName",
    ]) ||
    getString(basicInfo, [
      "farmerName",
      "farmer_name",
      "farmerFullName",
      "fullName",
      "full_name",
      "name",
      "userName",
    ]) ||
    getString(personalInfo, [
      "farmerName",
      "farmer_name",
      "fullName",
      "full_name",
      "name",
      "farmName",
      "farm_name",
    ]);

  return {
    farmerId,
    farmerName: farmerName || "Unknown farmer",
    farmLocation:
      getString(value, [
        "farmLocation",
        "farm_location",
        "location",
        "address",
      ]) ||
      getString(personalInfo, [
        "farmLocation",
        "farm_location",
        "location",
        "placeOfBirth",
        "place_of_birth",
      ]) ||
      "Location not available",
    farmerUrl:
      getString(value, [
        "farmerUrl",
        "farmer_url",
        "farmerProfileUrl",
        "farmer_profile_url",
        "profileUrl",
        "profile_url",
        "profile",
      ]) ||
      getString(basicInfo, ["profileUrl", "profile_url"]) ||
      null,
  };
}

export async function searchFarmersService(
  query: string,
): Promise<FarmerSearchResult[]> {
  const search = query.trim();

  if (search.length < 2) return [];

  try {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    if (!accessToken || !baseUrl) return [];

    const url = new URL(`${baseUrl}/farmers/search`);
    url.searchParams.set("page", "1");
    url.searchParams.set("size", "10");
    url.searchParams.set("keyword", search);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const items = getItemsFromPayload(isRecord(data) ? data.payload : null);
    return items
      .map(normalizeFarmerSearchResult)
      .filter((farmer): farmer is FarmerSearchResult => Boolean(farmer))
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function getUserProfileByIdService(
  userId: string | null | undefined,
): Promise<UserProfile | null> {
  if (!userId) return null;

  const session = await auth();
  if (!session?.user?.accessToken) throw new Error("User is not authenticated");

  try {
    const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/${userId}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${session.user.accessToken}`,
      },
    });

    if (!res.ok) return null;

    const result = await res.json();
    return result.payload ?? null;
  } catch {
    return null;
  }
}

// ─── Update Profile Info ─────────────────────────────────────────────────────
async function executeProfileUpdate<T>(
  endpoint: "update-government" | "update-farmer" | "update-buyer",
  payload: T,
): Promise<ApiResponse<unknown>> {
  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/${endpoint}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 204) {
    return { success: true, message: "Profile updated successfully." };
  }

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.success === false) {
    console.error("Profile update API failed", {
      endpoint,
      status: res.status,
      response: data,
      payload,
    });
    throw new Error(data?.message || "Failed to update profile.");
  }

  return data ?? { success: true, message: "Profile updated successfully." };
}

export async function updateGovernmentProfile(payload: GovernmentProfileUpdate) {
  return executeProfileUpdate("update-government", payload);
}

export async function updateFarmerProfile(payload: FarmerProfileUpdate) {
  return executeProfileUpdate("update-farmer", payload);
}

export async function updateBuyerProfile(payload: BuyerProfileUpdate) {
  return executeProfileUpdate("update-buyer", payload);
}

// ─── Update Bakong ────────────────────────────────────────────────────────────
export async function updateBakong(payload: UpdateBakongPayload) {
  const session = await auth();
  if (!session?.user?.accessToken) throw new Error("User is not authenticated");

  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/update-bakong`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 204) return;

  const body = await readResponseBody(res);

  if (res.status >= 500) {
    throw new Error("SERVICE_UNAVAILABLE");
  }

  if (!res.ok || (isRecord(body) && body.success === false)) {
    throw new Error(
      extractApiErrorMessage(body, "Failed to update Bakong account."),
    );
  }

  return body as UpdateBakongResponse;
}

// ─── Change Password ──────────────────────────────────────────────────────────
export async function changePassword(payload: ChangePasswordPayload) {
  const session = await auth();
  if (!session?.user?.accessToken) throw new Error("User is not authenticated");

  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/auth/change-password`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const body = await readResponseBody(res);

  if (!res.ok || (isRecord(body) && body.success === false)) {
    throw new Error(
      extractApiErrorMessage(body, "Change password request failed."),
    );
  }

  return body as ChangePasswordResponse;
}

// ─── Get User Role for Rating Page ───────────────────────────────────────────
export async function getRatingUserRoleService(): Promise<"farmer" | "buyer" | "government"> {
  try {
    const result = await getCurrentUserProfileServerService();
    const role = result?.payload?.basicInfo?.role ?? "buyer";
    return role.toLowerCase() as "farmer" | "buyer" | "government";
  } catch (error) {
    console.error("getRatingUserRoleService error:", error);
    return "buyer";
  }
}
