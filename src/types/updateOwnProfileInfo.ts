export interface BaseProfileUpdate {
  bio: string;
  profileUrl: string;
}

export interface GovernmentProfileUpdate extends BaseProfileUpdate {
  ministryName: string;
  addressProvinceId: string;
  addressDistrictId: string;
  addressCommuneId: string;
  addressVillageId: string;
}

export interface FarmerProfileUpdate extends BaseProfileUpdate {
  fullName: string;
  dateOfBirth: string;
  placeOfBirthProvinceId: string;
  farmName: string;
  farmSize: number;
  farmProvinceId: string;
  farmDistrictId: string;
  farmCommuneId: string;
  farmVillageId: string;
}

export interface BuyerProfileUpdate extends BaseProfileUpdate {
  fullName: string;
  dateOfBirth: string;
  placeOfBirthProvinceId: string;
  businessType: string;
  businessName: string;
  businessProvinceId: string;
  businessDistrictId: string;
  businessCommuneId: string;
  businessVillageId: string;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  payload?: T;
  data?: T;
  detail?: string;
  title?: string;
  status?: number;
  errors?: Record<string, string>;
}

export interface LocationItem {
  id: string;
  nameEn: string;
  nameKh: string
}