export type UnitType = "KG" | "TON";
export type ProductStatus = "AVAILABLE" | "UNAVAILABLE";

export interface CropProductPost {
  cropProductId?: string;
  cropProductPostId: string;
  postId: string;
  cropId: string;
  createdBy?: string;
  cropTypeId?: string;
  cropTypeName?: string;
  unitType: UnitType;
  currencyCode: string;
  pricePerUnit: number;
  totalQuantity: number;
  stockLeft: number;
  status: ProductStatus;
  title?: string;
  favoritePostId?: string;
  favoritedAt?: string;
  cropName?: string;
  cropType?: string;
  farmerId?: string;
  farmerName?: string;
  farmerProfileUrl?: string | null;
  sellerId?: string;
  sellerName?: string;
  sellerProfileUrl?: string | null;
  isSaved?: boolean;
  location?: string;
  imageUrls?: string | string[];
  thumbnailUrl?: string | string[] | null;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  farmerEmail?: string;
  farmerLocation?: string;
  farmerPhoneNumber?: string;
  crop?: {
    cropId?: string;
    cropName?: string;
    cropTypeId?: string;
    cropTypeName?: string;
  };
  cropProduct?: {
    cropProductId?: string;
    unitType?: UnitType;
    currencyCode?: string;
    pricePerUnit?: number;
    totalQuantity?: number;
    stockLeft?: number;
    status?: ProductStatus;
    crop?: {
      cropId?: string;
      cropName?: string;
      cropTypeId?: string;
      cropTypeName?: string;
    };
  };
  post?: {
    postId?: string;
    postType?: string;
    title?: string;
    description?: string;
    createdBy?: string;
    images?: string[];
  };
}

export type CropProductListParams = {
  page?: number;
  size?: number;
  search?: string;
  cropType?: string;
  region?: string;
  status?: string;
  deliveryDate?: string;
};

export type CropProductRequestBody = {
  title: string;
  description: string;
  cropId: string;
  unitType: string;
  currencyCode: string;
  pricePerUnit: number;
  totalQuantity: number;
  imageUrls: string[];
};

export type CropProductPagination = {
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
};

export type GetCropProductsResult = {
  data: CropProductPost[];
  error?: string;
  pagination?: CropProductPagination;
};

export type GetCropProductResult = {
  data: CropProductPost | null;
  error?: string;
};

export type CropProductMutationResult = {
  data?: CropProductPost | null;
  success?: boolean;
  error?: string;
};
