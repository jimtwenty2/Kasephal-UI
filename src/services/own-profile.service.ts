import headerToken from "@/lib/headerToken";
import { UserProfileResponse } from "@/types/user"; 
import { auth } from "@/auth";
import { env } from "@/lib/env";

export async function getUserProfile(): Promise<UserProfileResponse> {
  const session = await auth();

  if (!session?.user?.accessToken) {
    throw new Error("Unauthorized: No access token found");
  }

  const headers = await headerToken();

  const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/me`, {
    method: "GET",
    cache: "no-store",
    headers,
  });

  if (!res.ok) throw new Error("Failed to fetch user profile");

  const data: UserProfileResponse = await res.json();
  
  if (!data.success) throw new Error("Failed to fetch user profile data");

  return data;
}

export async function getUserProfileById(
  targetedUserId: string,
  accessToken?: string,
): Promise<UserProfileResponse | null> {
  if (!targetedUserId) return null;

  try {
    // Use passed token directly, or fall back to resolving from session
    let token = accessToken;
    if (!token) {
      const session = await auth();
      token = session?.user?.accessToken;
    }

    if (!token) return null;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${env.NEXT_BASE_API_URL}/profile/${targetedUserId}`, {
      method: "GET",
      cache: "no-store",
      headers,
    });

    if (!res.ok) return null;

    const data: UserProfileResponse = await res.json();

    if (!data.success) return null;

    return data;
  } catch {
    return null;
  }
}

// export interface FavoriteCropProduct {
//   cropId: string;
//   cropName: string;
//   cropTypeName: string;
//   currencyCode: string;
//   description: string;
//   favoritePostId: string;
//   favoritedAt: string;
//   postId: string;
//   pricePerUnit: number;
//   status: "AVAILABLE" | "UNAVAILABLE";
//   stockLeft: number;
//   thumbnailUrl: string | null;
//   title: string;
//   totalQuantity: number;
//   unitType: "KG" | "TON";
// }

// export interface Pagination {
//   page: number;
//   size: number;
//   totalElements: number;
//   totalPages: number;
// }

// export interface FavoriteCropProductsPayload {
//   items: FavoriteCropProduct[];
//   pagination: Pagination;
// }

// export interface FavoriteCropProductsResponse {
//   status: number;
//   message: string;
//   payload: FavoriteCropProductsPayload;
//   success: boolean;
//   timestamp: string;
// }

// // Get favorite crop products
// export async function getFavoriteCropProductsService(): Promise<FavoriteCropProduct[]> {
//   const headers = await headerToken ();
//   const res = await fetch(
//     `${process.env.NEXT_PUBLIC_BASE_URL}/favorites/crop-products`,
//     {
//       headers ,
//       next: {tags: ["favorite-crop-products"]},
//     }
//   );

//   if (!res.ok) {
//     throw new Error("Failed to fetch favorite crop products");
//   }

//   const data: FavoriteCropProductsResponse = await res.json();

//   return data.payload.items;
// }