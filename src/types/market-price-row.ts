export interface MarketPriceRow {
  marketPriceId: string;

  no: number;

  cropName: string;
  cropType: string;
  region: string;
  unit: string;
  currentPrice: number;
  minPrice: number;

  currencyCode: "KHR";
  validityDate: string;
  priceThresholds: number;
  scheduledAt: string;
}
