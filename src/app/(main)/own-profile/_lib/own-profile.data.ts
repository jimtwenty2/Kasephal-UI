import { auth } from "@/auth";
import { normalizeUserRole, ROLES } from "@/constants/role";
import {
  getCropDemandsByUserId,
  getCropDemandsOwn,
} from "@/services/cropDemand.service";
import {
  getFavoriteCropDemands,
  getFavoriteCropProducts,
} from "@/services/favorite.service";
import {
  getOrdersService,
  getOrderByIdService,
} from "@/services/order.service";
import {
  getCropProductsByUserId,
  getOwnCropProducts,
} from "@/services/cropProduct.service";
import { getReviewsByUserIdService } from "@/services/ranking.service";
import {
  getUserProfileById,
  getUserProfile,
} from "@/services/own-profile.service";
import { getFileUrl } from "@/utils/getFileUrl";
import type { FarmerReview } from "@/types/rankingView";
import type { UserProfilePayload } from "@/types/user";
import type {
  OwnProfilePageData,
  ProfileReviewItem,
  ProfileRole,
} from "./own-profile.types";

const PROFILE_PAGE_SIZE = 100;

const PROFILE_ROLES = new Set<string>([
  ROLES.FARMER,
  ROLES.BUYER,
  ROLES.GOVERNMENT,
]);

const FALLBACK_AVATAR = "/assets/no-profile.jpg";

const CRITERIA_LABELS: Record<string, string> = {
  crop_quality: "Crop Quality",
  overall_rating: "Overall Rating",
  contract_quality: "Contract Quality",
  delivery_performance: "Delivery Performance",
};

const EMPTY_PROFILE_DATA: OwnProfilePageData = {
  demandPosts: [],
  cropPosts: [],
  savedDemandPosts: [],
  savedCrops: [],
  orderHistory: [],
  ratings: [],
};

export async function getAuthorizedProfileRole(): Promise<ProfileRole | null> {
  const session = await auth();
  const role = normalizeUserRole(session?.user?.role);

  if (!role || !PROFILE_ROLES.has(role)) return null;

  if (role === ROLES.BUYER) return "buyer";
  if (role === ROLES.GOVERNMENT) return "government";

  return "farmer";
}

export async function getOwnProfileData(): Promise<OwnProfilePageData> {
  const session = await auth();
  const normalizedRole = normalizeUserRole(session?.user?.role);

  const role: ProfileRole | null =
    normalizedRole === ROLES.BUYER
      ? "buyer"
      : normalizedRole === ROLES.GOVERNMENT
        ? "government"
        : normalizedRole === ROLES.FARMER
          ? "farmer"
          : null;

  const accessToken = session?.user?.accessToken;
  const currentUserId = session?.user?.userId;

  // Fetch /profile/me so we can use it when the reviewer is the logged-in user
  let ownProfile: UserProfilePayload | null = null;
  try {
    const ownProfileRes = await getUserProfile();
    ownProfile = ownProfileRes?.payload ?? null;
  } catch {
    ownProfile = null;
  }

  const ratings =
    currentUserId && role
      ? await getRatings(
          currentUserId,
          role,
          accessToken,
          currentUserId,
          ownProfile,
        )
      : [];

  const [
    demandPostsResult,
    cropPostsResult,
    savedDemandPostsResult,
    savedCropsResult,
    orderHistory,
  ] = await Promise.all([
    getCropDemandsOwn({ page: 1, size: PROFILE_PAGE_SIZE }),
    getOwnCropProducts(1, PROFILE_PAGE_SIZE),
    getFavoriteCropDemands(1, PROFILE_PAGE_SIZE),
    getFavoriteCropProducts(1, PROFILE_PAGE_SIZE),
    getOrdersService(),
  ]);

  return {
    demandPosts: demandPostsResult.error ? [] : (demandPostsResult.data ?? []),
    cropPosts: cropPostsResult.error ? [] : (cropPostsResult.data ?? []),
    savedDemandPosts: savedDemandPostsResult.error
      ? []
      : (savedDemandPostsResult.data ?? []),
    savedCrops: savedCropsResult.error ? [] : (savedCropsResult.data ?? []),
    orderHistory: orderHistory ?? [],
    ratings,
  };
}

export async function getViewProfileData(
  targetedUserId: string,
  role: ProfileRole,
  profile?: UserProfilePayload | null,
): Promise<OwnProfilePageData> {
  if (!targetedUserId) {
    return EMPTY_PROFILE_DATA;
  }

  const session = await auth();
  const accessToken = session?.user?.accessToken;
  const currentUserId = session?.user?.userId;

  // Fetch own profile in case the logged-in user is also a reviewer here
  let ownProfile: UserProfilePayload | null = null;
  try {
    const ownProfileRes = await getUserProfile();
    ownProfile = ownProfileRes?.payload ?? null;
  } catch {
    ownProfile = null;
  }

  const aliases = getProfileAliases(profile);

  const [cropPostsResult, demandPostsResult, ratings] = await Promise.all([
    role === "farmer"
      ? getCropProductsByUserId(targetedUserId, 1, PROFILE_PAGE_SIZE)
      : Promise.resolve({ data: [] }),

    role === "buyer" || role === "government"
      ? getCropDemandsByUserId(
          targetedUserId,
          { page: 1, size: PROFILE_PAGE_SIZE },
          aliases,
        )
      : Promise.resolve({ data: [] }),

    getRatingsByUserId(
      targetedUserId,
      role,
      accessToken,
      currentUserId,
      ownProfile,
    ),
  ]);

  return {
    demandPosts: demandPostsResult.data ?? [],
    cropPosts: cropPostsResult.data ?? [],
    savedDemandPosts: [],
    savedCrops: [],
    orderHistory: [],
    ratings,
  };
}

function getProfileAliases(profile?: UserProfilePayload | null) {
  const personalInfo = profile?.personalInfo;

  return [
    personalInfo?.fullName,
    personalInfo?.farmName,
    personalInfo?.businessName,
    profile?.basicInfo.email,
  ].filter((value): value is string => Boolean(value?.trim()));
}

async function getRatings(
  userId: string,
  role: ProfileRole,
  accessToken?: string,
  currentUserId?: string,
  ownProfile?: UserProfilePayload | null,
): Promise<ProfileReviewItem[]> {
  // Reviews are fetched per role bucket: farmers keep their own bucket and
  // every other profile role (buyer, government) maps to the buyer bucket.
  const reviewRole = role === "farmer" ? "farmer" : "buyer";

  const result = await getReviewsByUserIdService(userId, reviewRole);

  return normalizeRatings(
    result.data ?? [],
    accessToken,
    currentUserId,
    ownProfile,
  );
}

export async function getRatingsByUserId(
  userId: string,
  role: ProfileRole,
  accessToken?: string,
  currentUserId?: string,
  ownProfile?: UserProfilePayload | null,
): Promise<ProfileReviewItem[]> {
  return getRatings(userId, role, accessToken, currentUserId, ownProfile);
}

async function normalizeRatings(
  items: FarmerReview[],
  accessToken?: string,
  currentUserId?: string,
  ownProfile?: UserProfilePayload | null,
): Promise<ProfileReviewItem[]> {
  const reviewerProfiles = new Map<string, UserProfilePayload | null>();

  async function fetchReviewerProfile(
    reviewerId: string,
  ): Promise<UserProfilePayload | null> {
    // If the reviewer is the logged-in user, use /profile/me data directly
    if (currentUserId && reviewerId === currentUserId && ownProfile) {
      return ownProfile;
    }

    if (reviewerProfiles.has(reviewerId)) {
      return reviewerProfiles.get(reviewerId) ?? null;
    }

    try {
      const profileRes = await getUserProfileById(reviewerId, accessToken);
      const profile = profileRes?.payload ?? null;
      reviewerProfiles.set(reviewerId, profile);
      return profile;
    } catch {
      reviewerProfiles.set(reviewerId, null);
      return null;
    }
  }

  const normalized = await Promise.all(
    items.map(async (item, index) => {
      const profile = item.reviewerId
        ? await fetchReviewerProfile(item.reviewerId)
        : null;

      let reviewerName =
        profile?.personalInfo?.fullName || profile?.basicInfo?.email || "";
      let reviewerAvatar = profile?.basicInfo?.profileUrl || "";

      if ((!reviewerName || !reviewerAvatar) && item.orderId) {
        try {
          const order = await getOrderByIdService(item.orderId);
          if (order) {
            const isReviewerBuyer =
              item.reviewType === "FARMER_REVIEW" ||
              item.reviewType === "FARMER";
            reviewerName =
              reviewerName ||
              (isReviewerBuyer
                ? order.buyerName || ""
                : order.farmerName || "");
            reviewerAvatar =
              reviewerAvatar ||
              (isReviewerBuyer
                ? order.buyerProfileUrl || ""
                : order.farmerProfileUrl || "");
          }
        } catch (err) {
          console.error("Failed to fetch order fallback:", err);
        }
      }

      const avatar = reviewerAvatar
        ? getFileUrl(reviewerAvatar)
        : FALLBACK_AVATAR;

      const criteriaScores = Object.entries(item.criteriaScores ?? {})
        .filter(
          (entry): entry is [string, number] => typeof entry[1] === "number",
        )
        .map(([key, value]) => ({
          label: CRITERIA_LABELS[key] ?? key.replace(/_/g, " "),
          value,
        }));

      return {
        id: item.reviewId || String(index + 1),
        reviewerId: item.reviewerId || undefined,
        author: reviewerName
          ? reviewerName
          : item.reviewerId
            ? `Reviewer ${getReviewIdSuffix(item.reviewerId)}`
            : "Anonymous",
        date: formatDate(item.createdAt),
        avatar,
        rating: clampRatingValue(item.overallRating),
        comment: item.feedback || "No review comment.",
        criteriaScores,
      };
    }),
  );

  return normalized;
}

function getReviewIdSuffix(value: string) {
  const normalized = value.trim();
  const lastSegment = normalized.split("-").pop() ?? normalized;
  return lastSegment.slice(-4).padStart(4, "0");
}

function clampRatingValue(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(0, rating));
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
