// types/admin/policy.ts
export interface Policy {
    policyId: string;
    title: string;
    content: string;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface PoliciesResponse {
    success: boolean;
    status: number;
    message: string;
    payload: {
        items: Policy[];
        pagination: {
            page: number;
            size: number;
            totalElements: number;
            totalPages: number;
        };
    };
}