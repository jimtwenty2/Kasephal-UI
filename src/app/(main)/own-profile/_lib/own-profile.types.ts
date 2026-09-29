import type { CropDemandPost } from "@/types/crop-demand";
import type { CropProductPost } from "@/types/crop-product";
import type { Order } from "@/services/order.service";

export type ProfileRole = "farmer" | "buyer" | "government";

export type ProfileReviewItem = {
  id: string;
  reviewerId?: string;
  author: string;
  date: string;
  avatar: string;
  rating: number;
  comment: string;
  criteriaScores: {
    label: string;
    value: number;
  }[];
};

export type OwnProfilePageData = {
  demandPosts: CropDemandPost[];
  cropPosts: CropProductPost[];
  savedDemandPosts: CropDemandPost[];
  savedCrops: CropProductPost[];
  orderHistory: Order[];
  ratings: ProfileReviewItem[];
};
