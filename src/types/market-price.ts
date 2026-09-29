export interface MarketPrice {
  marketPriceId: string;

  crop: {
    cropId: string;
    cropName: string;
    cropTypeName: string;
    userId: string;
  };

  unitType: string;
  currencyCode: string;

  currentPricePerUnit: number;
  minFloorPrice: number;

  validityDate: string;
  priceThresholds: number;

  scheduledAt: string;

  region: string;

  createdAt: string;
  updatedAt: string;

  createdBy: string;
}

export interface CreateMarketPriceRequest {
  
  cropName: string;
  cropType: string;
  unitType: "KG" | "TON";
  region: string;
  currencyCode: "KHR";
  currentPricePerUnit: number;
  minFloorPrice: number;
  validityDate: string;
  priceThresholds: number;
  scheduledAt: string;
}

export interface UpdateMarketPriceBulkRequest {
  marketPriceId: string;
  cropName: string;
  cropType: string;
  unitType: "KG" | "TON";
  region: string;
  currencyCode: "KHR";
  currentPricePerUnit: number;
  minFloorPrice: number;
  validityDate: string;
  priceThresholds: number;
  scheduledAt: string;
}

export type UpdateMarketPriceRequest = CreateMarketPriceRequest;

export type MarketPriceWarningType =
  | "HIGHER_THAN_MARKET"
  | "LOWER_THAN_MARKET"
  | "BELOW_FLOOR_PRICE"
  | "NORMAL";

export interface MarketPriceCheckResponse {
  warningType: MarketPriceWarningType;
  inputPricePerUnit: number;
  currentMarketPrice: number;
  minFloorPrice: number;
  thresholdPercent: number;
  deviationPercent: number;
  region: string;
  unitType: string;
  currencyCode: string;
  cropId: string;
  marketPriceId: string;
  marketPriceValidityDate: string;
}

export type MarketPriceCheckContext =
  | "CROP_PRODUCT_ORDER"
  | "CROP_DEMAND_CONTRACT";

export interface MarketPriceCheckRequest {
  context: MarketPriceCheckContext;
  postId: string;
  unitType: "KG" | "TON" | "TONS" | string;
  currencyCode: "KHR" | "USD" | string;
  pricePerUnit: number;
}
