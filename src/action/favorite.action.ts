"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  addFavorite,
  deleteFavorite,
  getFavoriteCropDemands,
  getFavoriteCropProducts,
  type FavoriteCropDemandsResult,
  type FavoriteCropProductsResult,
  type FavoriteMutationResult,
} from "@/services/favorite.service";

function revalidateFavorites() {
  revalidateTag("favorites", "max");
  revalidatePath("/listing-crop-demands", "page");
  revalidatePath("/own-profile", "page");
}

export async function getFavoriteCropDemandsAction(
  page = 1,
  size = 10,
): Promise<FavoriteCropDemandsResult> {
  return getFavoriteCropDemands(page, size);
}

export async function getFavoriteCropProductsAction(
  page = 1,
  size = 10,
): Promise<FavoriteCropProductsResult> {
  return getFavoriteCropProducts(page, size);
}

export async function addFavoriteAction(
  postId: string,
): Promise<FavoriteMutationResult> {
  const result = await addFavorite(postId);

  if (result.success) revalidateFavorites();

  return result;
}

export async function deleteFavoriteAction(
  postId: string,
): Promise<FavoriteMutationResult> {
  const result = await deleteFavorite(postId);

  if (result.success) revalidateFavorites();

  return result;
}
