import { getUserProfileById } from "@/services/own-profile.service";
import { normalizeCropProductImageUrl } from "@/lib/cropProductImage";
import { FALLBACK_PROFILE_AVATAR } from "./profileDisplay";
import type { FarmerReview } from "@/types/rankingView";
import { getOrderByIdService } from "@/services/order.service";

export async function resolveReviewersDisplayInfo(
  reviews: FarmerReview[],
): Promise<Record<string, { name: string; avatar: string }>> {
  const resultMap: Record<string, { name: string; avatar: string }> = {};

  await Promise.all(
    reviews.map(async (review) => {
      const reviewerId = review.reviewerId;
      if (!reviewerId) return;

      // If already resolved to a real name, skip duplicate resolution.
      if (resultMap[reviewerId] && resultMap[reviewerId].name !== "Anonymous User") {
        return;
      }

      try {
        const profileRes = await getUserProfileById(reviewerId);
        const profile = profileRes?.payload ?? null;
        let name = profile?.personalInfo?.fullName || profile?.basicInfo?.email || "";
        let avatar = profile?.basicInfo?.profileUrl
          ? normalizeCropProductImageUrl(profile.basicInfo.profileUrl)
          : "";

        if (!name && review.orderId) {
          try {
            const order = await getOrderByIdService(review.orderId);
            if (order) {
              const isReviewerBuyer = review.reviewType === "FARMER_REVIEW" || review.reviewType === "FARMER";
              name = isReviewerBuyer
                ? order.buyerName || ""
                : order.farmerName || "";
              avatar = isReviewerBuyer
                ? order.buyerProfileUrl || ""
                : order.farmerProfileUrl || "";
            }
          } catch (err) {
            console.error("Failed to fetch order fallback:", err);
          }
        }

        resultMap[reviewerId] = {
          name: name || "Anonymous User",
          avatar: avatar ? normalizeCropProductImageUrl(avatar) : FALLBACK_PROFILE_AVATAR,
        };
      } catch {
        resultMap[reviewerId] = {
          name: "Anonymous User",
          avatar: FALLBACK_PROFILE_AVATAR,
        };
      }
    }),
  );

  return resultMap;
}

