import { auth } from "@/auth";
import { env } from "@/lib/env";
import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

// ── Raw API shape (what the API actually returns) ──────────────────────────────
export interface IdentityVerificationItem {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    profileUrl: string | null;
    identityDocumentId: string;
    documentType: string;
    role: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    submittedAt: string;
    address?: string;
}

type UnknownRecord = Record<string, unknown>;

// ── Detail shape — matches exactly what the API returns ───────────────────────
// NOTE: the API does NOT return dob or address; those fields do not exist.
export type IdentityVerificationDetail = {
    backImageUrl: string | null;
    documentType: string;
    email: string;
    phoneNumber?: string;
    frontImageUrl: string | null;
    fullName: string;
    identityDocumentId: string;
    profileUrl: string | null;
    rejectionReason: string | null;
    role: string;
    status: string;
    submittedAt: string;
    userId: string;
    address?: string;
    fullAddress?: string;
    location?: string;
    businessAddress?: string;
    governmentAddress?: string;
    farmLocation?: string;
    placeOfBirth?: string;
};

// ── Mapped shape (single source of truth — used throughout the UI) ─────────────
export interface IdentityVerification {
    user_id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    profile: string | null;
    document: string;
    documentType: string;   // ← ADD THIS LINE
    role: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    submissionDate: string;
    address?: string;
}

export interface IdentityVerificationSummary {
    approved: number;
    pending: number;
    rejected: number;
}

export interface IdentityVerificationPagination {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface IdentityVerificationsResult {
    items: IdentityVerificationItem[];
    pagination: IdentityVerificationPagination | null;
    summary: IdentityVerificationSummary | null;
}

interface IdentityVerificationResponse {
    success: boolean;
    message: string;
    payload: {
        items: IdentityVerificationItem[];
        pagination: IdentityVerificationPagination;
        summary: IdentityVerificationSummary;
    };
}

export interface GetVerificationsParams {
    page?: number;
    size?: number;
    role?: string;
    search?: string;
}

export interface VerificationStats {
    awaitReviews: number;
    rejectedRequests: number;
    totalVerified: number;
}

interface VerificationStatsResponse {
    success: boolean;
    message: string;
    payload: VerificationStats;
}

interface IdentityVerificationDetailResponse {
    success: boolean;
    message: string;
    payload: IdentityVerificationDetail;
}

interface UserProfileResponse {
    success: boolean;
    message?: string;
    payload?: unknown;
}

// ── Defaults ───────────────────────────────────────────────────────────────────
const EMPTY: IdentityVerificationsResult = {
    items: [],
    pagination: null,
    summary: null,
};

const EMPTY_STATS: VerificationStats = {
    awaitReviews: 0,
    rejectedRequests: 0,
    totalVerified: 0,
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function buildQuery(params?: GetVerificationsParams): string {
    const query = new URLSearchParams({
        page: String(params?.page ?? 1),
        size: String(params?.size ?? 10),
    });
    if (params?.role) query.set("role", params.role);
    if (params?.search) query.set("search", params.search);
    return query.toString();
}

function parseResponse(
    data: IdentityVerificationResponse,
): IdentityVerificationsResult {
    return {
        items: data.payload?.items ?? [],
        pagination: data.payload?.pagination ?? null,
        summary: data.payload?.summary ?? null,
    };
}

async function getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;
    return {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
}

async function safeJson(
    res: Response,
): Promise<Record<string, unknown> | null> {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

// ── Server-side ────────────────────────────────────────────────────────────────
export async function getIdentityVerificationsService(
    params?: GetVerificationsParams,
): Promise<IdentityVerificationsResult> {
    try {
        const session = await auth();
        const accessToken = session?.user?.accessToken;

        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/admin/identity-verifications?${buildQuery(params)}`,
            {
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            },
        );

        if (res.status === 404) return EMPTY;
        const data: IdentityVerificationResponse = await res.json();
        if (!res.ok || !data.success) return EMPTY;

        return parseResponse(data);
    } catch (error) {
        console.error("Identity verifications fetch failed:", error);
        return EMPTY;
    }
}

export async function getVerificationStatsService(): Promise<VerificationStats> {
    try {
        const session = await auth();
        const accessToken = session?.user?.accessToken;

        const res = await fetch(
            `${env.NEXT_BASE_API_URL}/users/verification-stats`,
            {
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                },
            },
        );

        if (!res.ok) return EMPTY_STATS;
        const data: VerificationStatsResponse = await res.json();
        if (!data.success) return EMPTY_STATS;

        return data.payload;
    } catch (error) {
        console.error("Verification stats fetch failed:", error);
        return EMPTY_STATS;
    }
}

// ── Client-side ────────────────────────────────────────────────────────────────
export async function getIdentityVerificationsClientService(
    params?: GetVerificationsParams,
): Promise<IdentityVerificationsResult> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(
            `${API_URL}/admin/identity-verifications?${buildQuery(params)}`,
            { headers },
        );

        if (res.status === 404) return EMPTY;
        const data: IdentityVerificationResponse = await res.json();
        if (!res.ok || !data.success) return EMPTY;

        return parseResponse(data);
    } catch (error) {
        console.error("Identity verifications client fetch failed:", error);
        return EMPTY;
    }
}

export async function getVerificationStatsClientService(): Promise<VerificationStats> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/users/verification-stats`, { headers });

        if (!res.ok) return EMPTY_STATS;
        const data: VerificationStatsResponse = await res.json();
        if (!data.success) return EMPTY_STATS;

        return data.payload;
    } catch (error) {
        console.error("Verification stats client fetch failed:", error);
        return EMPTY_STATS;
    }
}

/**
 * Fetches the full detail for a single identity verification.
 * GET /admin/identity-verifications/{identityDocumentId}
 */
export async function getIdentityVerificationDetailClientService(
    identityDocumentId: string,
): Promise<IdentityVerificationDetail | null> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(
            `${API_URL}/admin/identity-verifications/${identityDocumentId}`,
            { headers },
        );

        if (!res.ok) {
            const body = await safeJson(res);
            console.error(
                "Fetch verification detail failed",
                "| status:", res.status,
                "| id:", identityDocumentId,
                "| message:", body?.message ?? "(no body)",
            );
            return null;
        }

        const data: IdentityVerificationDetailResponse = await res.json();
        if (!data.success) {
            console.error("Fetch verification detail: success=false | id:", identityDocumentId);
            return null;
        }

        return data.payload;
    } catch (error) {
        console.error("Fetch verification detail error:", error);
        return null;
    }
}

// ── Actions ────────────────────────────────────────────────────────────────────
export async function getIdentityVerificationUserProfileClientService(
    userId: string,
): Promise<unknown | null> {
    if (!userId) return null;

    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/profile/${userId}`, { headers });

        if (!res.ok) {
            const body = await safeJson(res);
            console.error(
                "Fetch verification user profile failed",
                "| status:", res.status,
                "| userId:", userId,
                "| message:", body?.message ?? "(no body)",
            );
            return null;
        }

        const data = (await res.json()) as UserProfileResponse;
        if (data.success === false) return null;

        return data.payload ?? null;
    } catch (error) {
        console.error("Fetch verification user profile error:", error);
        return null;
    }
}

export async function updateVerificationStatusService(
    identityDocumentId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason = "",
): Promise<boolean> {
    const url = `${API_URL}/admin/identity-verifications/${identityDocumentId}/status`;
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status, rejectionReason }),
        });

        if (!res.ok) {
            const data = await safeJson(res);
            console.error(
                `Update verification status error — status: ${res.status}`,
                "| message:", data?.message ?? "(no body)",
                "| url:", url,
            );
            return false;
        }

        const data = await safeJson(res);
        return data?.success !== false;
    } catch (error) {
        console.error("Update verification status failed:", error);
        return false;
    }
}

export function approveVerificationService(
    identityDocumentId: string,
): Promise<boolean> {
    return updateVerificationStatusService(identityDocumentId, "APPROVED");
}

export function rejectVerificationService(
    identityDocumentId: string,
    reason = "",
): Promise<boolean> {
    return updateVerificationStatusService(identityDocumentId, "REJECTED", reason);
}

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null;
}

function getCleanString(value: unknown): string | undefined {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed && trimmed.toLowerCase() !== "string") return trimmed;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }

    return undefined;
}

function formatAddressObject(value: UnknownRecord): string | undefined {
    const directValue = getCleanString(value.fullAddress) ??
        getCleanString(value.address) ??
        getCleanString(value.location) ??
        getCleanString(value.name);

    if (directValue) return directValue;

    const parts = [
        value.village,
        value.commune,
        value.district,
        value.province,
        value.city,
        value.country,
    ]
        .map(getCleanString)
        .filter((part): part is string => Boolean(part));

    return parts.length > 0 ? parts.join(", ") : undefined;
}

export function normalizeIdentityAddress(value: unknown): string | undefined {
    if (!isRecord(value)) return undefined;

    const directAddressKeys = [
        "address",
        "fullAddress",
        "location",
        "addressLocation",
        "businessAddress",
        "businessLocation",
        "governmentAddress",
        "governmentLocation",
        "farmLocation",
        "placeOfBirth",
    ];

    for (const key of directAddressKeys) {
        const cleanValue = getCleanString(value[key]);
        if (cleanValue) return cleanValue;

        if (isRecord(value[key])) {
            const objectValue = formatAddressObject(value[key]);
            if (objectValue) return objectValue;
        }
    }

    for (const key of [
        "basicInfo",
        "personalInfo",
        "profile",
        "farmerProfile",
        "buyerProfile",
        "governmentProfile",
    ]) {
        const nestedAddress = normalizeIdentityAddress(value[key]);
        if (nestedAddress) return nestedAddress;
    }

    return undefined;
}
