
import { env } from "@/lib/env";
import { ApiResponse } from "@/types/api-response";
import headerToken from "@/lib/headerToken";


export type CropDemandItem = {
    cropDemandPostId: string;
    cropId: string;
    cropName: string;
    cropTypeId: string;
    cropTypeName: string;
    currencyCode: string;
    demandLevel: "LOW" | "MODERATE" | "HIGH";
    description: string;
    expectedDeliveryDate: string;
    imageUrls: string[];
    isSaved: boolean;
    locationPreferences: string;
    maxPricePerUnit: number;
    postId: string;
    quantityNeeded: number;
    status: "OPEN" | "CLOSED" | "MATCHED";
    title: string;
    unitType: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
};

export type CropDemandPagination = {
    items: CropDemandItem[];
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
};

export async function getCropDemandsService(params?: {
    page?: number;
    size?: number;
    status?: string;
}): Promise<CropDemandItem[]> {
   
    const headers = await headerToken();
    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("size", String(params?.size ?? 3));
    if (params?.status) query.set("status", params.status);

    try {
        const response = await fetch(
            `${env.NEXT_BASE_API_URL}/crop-demands?${query.toString()}`,
            {
                headers,
                cache: "no-store",
               
            }
        );

        if (!response.ok) {
            console.error(`Failed to fetch crop demands (${response.status})`);
            return [];
        }

        const result: ApiResponse<CropDemandPagination> = await response.json();

        return result.payload.items ?? [];
    } catch (error) {
        console.error("getCropDemandsService error:", error);
        return [];
    }
}
