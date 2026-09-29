
export interface ReviewAttachment {
  reviewAttachmentId: string;
  fileName: string;
}

export interface CriteriaScores {
  crop_quality?: number;
  overall_rating?: number;
  contract_quality?: number;
  delivery_performance?: number;
  [key: string]: number | undefined; 
}

// ── Review type enum ──────────────────────────────────
export type ReviewType = "FARMER_REVIEW" | "BUYER_REVIEW" | "FARMER" | "BUYER";

// ── Single review item ────────────────────────────────
export interface FarmerReview {
  reviewId: string;
  reviewType: ReviewType;
  overallRating: number;
  criteriaScores: CriteriaScores;
  feedback: string;
  reviewerId: string;
  revieweeId: string;
  orderId: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  attachments: ReviewAttachment[];
}

// ── API response wrapper ──────────────────────────────
export interface FarmerReviewsResponse<T = FarmerReview[]> {
  status: number;
  message: string;
  payload: T;
  success: boolean;
  timestamp: string; // ISO 8601
}

export type FarmerReviewResponse = {
  data?: FarmerReview;
};

export type GetReviewsResult = {
  data: FarmerReview[];
  error?: string;
};

export type GetReviewResult = {
  data: FarmerReview | null;
  error?: string;
};
