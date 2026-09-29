import { auth } from "@/auth";
import { env } from "@/lib/env";
import { ApiResponse } from "@/types/api-response";

export type CropProduct = {
    cropProductPostId: string;
    cropName: string;
    cropTypeName: string;
    currencyCode: string;
    pricePerUnit: number;
    totalQuantity: number;
    stockLeft: number;
    unitType: string;
    status: "AVAILABLE" | "UNAVAILABLE";
    farmerName: string;
    farmerProfileUrl: string | null;
    imageUrls: string[];
    title: string;
    description: string;
};

export type CropProductPayload = {
    items: CropProduct[];
    pagination: {
        page: number;
        size: number;
        totalElements: number;
        totalPages: number;
    };
};

export type TopValueCrop = { rank: number; name: string; value: string };
export type TopVolumeCrop = { rank: number; name: string; volume: string };

export async function getCropProductsService(params?: {
    page?: number;
    size?: number;
}): Promise<CropProductPayload> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        throw new Error("User is not authenticated");
    }

    const query = new URLSearchParams();
    query.set("page", String(params?.page ?? 1));
    query.set("size", String(params?.size ?? 10));

    const response = await fetch(
        `${env.NEXT_BASE_API_URL}/crop-products?${query.toString()}`,
        {
            cache: "no-store",
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch crop products (${response.status})`);
    }

    const result: ApiResponse<CropProductPayload> = await response.json();
    return result.payload;
}

export async function getTopCropsByValue(limit = 3): Promise<TopValueCrop[]> {
    const { items } = await getCropProductsService();
    return [...items]
        .sort((a, b) => b.pricePerUnit - a.pricePerUnit)
        .slice(0, limit)
        .map((item, index) => ({
            rank: index + 1,
            name: item.cropName,
            value: `${item.pricePerUnit.toLocaleString()} ${item.currencyCode}`,
        }));
}

export async function getTopCropsByVolume(limit = 3): Promise<TopVolumeCrop[]> {
    const { items } = await getCropProductsService();
    return [...items]
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, limit)
        .map((item, index) => ({
            rank: index + 1,
            name: item.cropName,
            volume: `${item.totalQuantity.toLocaleString()} ${item.unitType}`,
        }));
}