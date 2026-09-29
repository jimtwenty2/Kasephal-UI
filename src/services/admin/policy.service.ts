import { auth } from "@/auth";
import { env } from "@/lib/env";
import { getSession } from "next-auth/react";
import { Policy, PoliciesResponse } from "@/types/admin/policy";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL;

// ── Server-side ────────────────────────────────────────────────────────────────
export async function getPoliciesService(): Promise<Policy[]> {
    try {
        const session = await auth();
        const accessToken = session?.user?.accessToken;

        const res = await fetch(`${env.NEXT_BASE_API_URL}/admin/policies`, {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
        });

        if (res.status === 404) return [];
        const data: PoliciesResponse = await res.json();
        if (!res.ok || !data.success) return [];
        return data.payload?.items ?? [];
    } catch (error) {
        console.error("Policies fetch failed:", error);
        return [];
    }
}

// ── Client-side helpers ────────────────────────────────────────────────────────
async function getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();
    const accessToken = session?.user?.accessToken;
    return {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };
}

// CREATE
export async function createPolicyService(body: {
    title: string;
    content: string;
}): Promise<Policy | null> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/policies`, {
            method: "POST",
            headers,
            body: JSON.stringify({ ...body, status: "DRAFT" }),
        });
        const data = await res.json();
        if (!res.ok) {
            console.error("Create policy error:", data);
            return null;
        }
        return data.payload;
    } catch (error) {
        console.error("Create policy failed:", error);
        return null;
    }
}

// UPDATE
export async function updatePolicyService(
    policyId: string,
    body: {
        title: string;
        content: string;
        status: "DRAFT" | "PUBLISHED";
    },
): Promise<Policy | null> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/policies/${policyId}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
            console.error("Update policy error:", data);
            return null;
        }
        return data.payload;
    } catch (error) {
        console.error("Update policy failed:", error);
        return null;
    }
}

// PUBLISH
export async function publishPolicyService(
    policyId: string,
): Promise<Policy | null> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/policies/${policyId}/publish`, {
            method: "PATCH",
            headers,
        });
        const data = await res.json();
        if (!res.ok) {
            console.error("Publish policy error:", data);
            return null;
        }
        return data.payload;
    } catch (error) {
        console.error("Publish policy failed:", error);
        return null;
    }
}