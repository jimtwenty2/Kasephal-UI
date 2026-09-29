import type { Contract } from "@/services/contract.service";
import type { CropDemandItem } from "@/services/crop-demand.service";
import type { CropProduct } from "@/services/crop-product.service";
import type { ExchangeRate } from "@/services/exchange-rate.service";
import type { Order } from "@/services/order.service";
import type { UserProfile } from "@/services/profile.service";
import type { CropProductPost } from "@/types/crop-product";
import type { Crop } from "@/types/cropType";
import type { CropType } from "@/types/cropType";
import type { MarketPrice } from "@/types/market-price";

export type FarmerDashboardOverviewStats = {
  activeCropPosts: number;
  totalContracts: number;
  activeContracts: number;
  availableWithdrawUsd: number;
  availableWithdrawKhr: number;
};

export type BuyerDashboardOverviewStats = {
  totalContracts: number;
  activeContracts: number;
  availableRefundUsd: number;
  availableRefundKhr: number;
};

export type GovernmentDashboardOverviewStats = {
  totalCropNames: number;
  totalCropTypes: number;
  totalContracts: number;
  totalOrders: number;
};

export type GovernmentLeadingCrop = {
  rank: number;
  cropName: string;
  value: number;
  volumeKg: number;
};

export type GovernmentMonthlyOrder = {
  label: string;
  orderCount: number;
};

export type GovernmentPriceChange = {
  marketPriceId: string;
  cropId: string;
  cropName: string;
  cropTypeName: string;
  region: string;
  unitType: string;
  currencyCode: string;
  currentPrice: number;
  minFloorPrice: number;
  thresholdValue: number;
  changeAmount: number;
  changePercent: number;
  effectiveDate: string;
};

export type GovernmentPriceHistory = {
  marketPriceId: string;
  cropId: string;
  cropName: string;
  region: string;
  currencyCode: string;
  unitType: string;
  validUntil: string;
  currentPrice: number;
  minFloorPrice: number;
  thresholdValue: number;
  ceilingPrice: number;
  points: {
    label: string;
    value: number;
  }[];
};

export type FarmerDashboardOverview = {
  role: "FARMER";
  profile: UserProfile | null;
  orders: Order[];
  contracts: Contract[];
  exchangeRates: ExchangeRate[];
  cropDemands: CropDemandItem[];
  ownCropProducts: CropProductPost[];
  stats: FarmerDashboardOverviewStats;
};

export type BuyerDashboardOverview = {
  role: "BUYER";
  profile: UserProfile | null;
  orders: Order[];
  contracts: Contract[];
  exchangeRates: ExchangeRate[];
  ownCropDemands: CropDemandItem[];
  cropProducts: CropProduct[];
  stats: BuyerDashboardOverviewStats;
};

export type GovernmentDashboardOverview = {
  role: "GOVERNMENT";
  profile: UserProfile | null;
  orders: Order[];
  contracts: Contract[];
  exchangeRates: ExchangeRate[];
  marketPrices: MarketPrice[];
  leadingCrops: {
    topByValue: GovernmentLeadingCrop[];
    topByVolume: GovernmentLeadingCrop[];
  };
  monthlyOrders: GovernmentMonthlyOrder[];
  priceChanges: GovernmentPriceChange[];
  priceHistory: GovernmentPriceHistory | null;
  cropTypes: CropType[];
  crops: Crop[];
  cropProducts: CropProduct[];
  stats: GovernmentDashboardOverviewStats;
};
