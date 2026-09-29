export type UnitType = "KG" | "TON" | "TONS";
export type DemandLevel = "LOW" | "MODERATE" | "HIGH";
export type DemandStatus = "OPEN" | "CLOSED" | "MATCHED" | "APPLY";
export type UserRole = "FARMER" | "BUYER" | "GOVERNMENT" | "ADMIN";

export interface CropDemandPost {
  createdAt: string;
  createdBy?: string;
  createdById?: string;
  cropDemandPostId: string;
  cropId?: string;
  cropName: string;
  cropType: string;
  cropTypeId?: string;
  cropTypeName?: string;
  buyerName: string;
  buyerId?: string;
  userId?: string;
  buyerProfileUrl: string;
  currencyCode: "USD" | "KHR" ;
  demandLevel: DemandLevel;
  description?: string;
  expectedDeliveryDate: string;
  imageUrls: string[];
  thumbnailUrl?: string | string[];
  locationPreferences: string;
  maxPricePerUnit: number;
  postId?: string;
  quantityNeeded: number;
  status: DemandStatus;
  title: string;
  unitType: UnitType;
  updatedAt?: string;
  isOffered?: boolean;
  isSaved: boolean;
  role?: UserRole;
  buyerEmail?: string;
  buyerLocation?: string;
  buyerPhoneNumber?: string;
}

export type Pagination = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type CropDemandListParams = {
  search?: string;
  cropType?: string;
  region?: string;
  status?: string;
  page?: number;
  size?: number;
};

export type CropDemandListPayload = {
  content?: CropDemandPost[];
  data?: CropDemandPost[];
  items?: CropDemandPost[];
  results?: CropDemandPost[];
  pagination?: Partial<Pagination> & {
    total?: number;
    totalItems?: number;
    pageNumber?: number;
    currentPage?: number;
    pageSize?: number;
  };
  total?: number;
  totalItems?: number;
  pageNumber?: number;
  currentPage?: number;
  pageSize?: number;
} & Partial<Pagination>;

export type CropDemandRequestBody = {
  title: string;
  description?: string;
  cropId: string;
  unitType: string;
  currencyCode: string;
  maxPricePerUnit: number;
  quantityNeeded: number;
  locationPreferences: string;
  expectedDeliveryDate: string;
  demandLevel: string;
  imageUrls: string[];
};

export type UpdateCropDemandStatusBody = {
  status: DemandStatus;
};

export type GetCropDemandsResult = {
  data: CropDemandPost[];
  pagination: Pagination;
  error?: string;
};

export type GetCropDemandResult = {
  data: CropDemandPost | null;
  error?: string;
};

export type CropDemandMutationResult = {
  success: boolean;
  data?: CropDemandPost | null;
  error?: string;
};

export type CropDemandApiResponse = {
  success?: boolean;
  message?: string;
  detail?: string;
  title?: string;
  error?: string;
  errors?: string | string[] | { [key: string]: string | string[] | undefined };
  payload?: CropDemandListPayload | CropDemandPost[] | CropDemandPost | null;
};