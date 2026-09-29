export type UnitType = "KG" | "TONS";
export type ProductStatus = "AVAILABLE" | "UNAVAILABLE";

export interface MyCropProduct {
  createdAt: string;
  createdBy: string;
  cropId: string;
  cropName: string;
  cropProductPostId: string;
  cropTypeId: string;
  cropTypeName: string;
  currencyCode: string;
  description: string;
  farmerName: string;
  farmerProfileUrl: string | null;
  imageUrls: string[];
  isSaved: boolean;
  postId: string;
  pricePerUnit: number;
  status: ProductStatus;
  stockLeft: number;
  title: string;
  totalQuantity: number;
  unitType: UnitType;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface MyCropProductsPayload {
  items: MyCropProduct[];
  pagination: Pagination;
}

export interface MyCropProductsResponse {
  status: number;
  message: string;
  payload: MyCropProductsPayload;
  success: boolean;
  timestamp: string;
}