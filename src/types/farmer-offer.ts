export type FarmerOfferItem = {
  createdAt: string;
  cropDemandPostId: string;
  currencyCode?: "KHR" | "USD" | string | null;
  estimatedDeliveryDate: string;
  farmerId: string;
  farmLocation?: string | null;
  farmerLocation?: string | null;
  farmerName: string;
  farmerOfferId: string;
  farmerProfileUrl: string | null;
  message: string;
  offeredQuantity: number;
  proposedPricePerUnit: number;
  reviewCount?: number | null;
  trustScore: number;
  location?: string | null;
  updatedAt: string;
};

export type FarmerOfferListPayload = {
  items: FarmerOfferItem[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type FarmerOfferApiResponse<T = unknown> = {
  success?: boolean;
  status?: number;
  message?: string;
  detail?: string;
  payload?: T;
  data?: unknown;
};

export type FarmerOfferRequestBody = {
  currencyCode: "KHR" | "USD" | string;
  proposedPricePerUnit: number;
  offeredQuantity: number;
  estimatedDeliveryDate: string;
  message?: string;
};

export type FarmerOfferMutationResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};
