export type UserRole = "FARMER" | "BUYER" | "ADMIN" | "GOVERNMENT";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE" | "BANNED";

export type UserRoleFilter = "farmer" | "buyer" | "government";

export type LocationValue =
  | string
  | number
  | {
      id?: string | null;
      locationId?: string | null;
      name?: string | null;
      nameEn?: string | null;
      nameKh?: string | null;
      value?: string | null;
      label?: string | null;
    };

export interface User {
  userId: string;
  name?: string | null;
  fullName?: string | null;
  full_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email: string | null;
  phoneNumber: string | null;
  profileUrl: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  isOtpVerified: boolean;
  createdAt: string;
  personalInfo?: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    placeOfBirth?: string | null;
    address?: string | null;
    fullAddress?: string | null;
    location?: string | null;
    farmLocation?: string | null;
    farmSize?: string | number | null;
    farmProvince?: LocationValue | null;
    farmDistrict?: LocationValue | null;
    farmCommune?: LocationValue | null;
    farmVillage?: LocationValue | null;
    businessName?: string | null;
    businessType?: string | null;
    businessLocation?: string | null;
    businessProvince?: LocationValue | null;
    businessDistrict?: LocationValue | null;
    businessCommune?: LocationValue | null;
    businessVillage?: LocationValue | null;
    ministryName?: string | null;
    ministryAddress?: string | null;
    organizationName?: string | null;
    addressProvince?: LocationValue | null;
    addressDistrict?: LocationValue | null;
    addressCommune?: LocationValue | null;
    addressVillage?: LocationValue | null;
    placeOfBirthProvince?: LocationValue | null;
    placeOfBirthDistrict?: LocationValue | null;
    placeOfBirthCommune?: LocationValue | null;
    placeOfBirthVillage?: LocationValue | null;
  } | null;
  farmerProfile?: {
    fullName?: string | null;
    name?: string | null;
    address?: string | null;
    location?: string | null;
    farmLocation?: string | null;
    farmSize?: string | number | null;
  } | null;
  buyerProfile?: {
    fullName?: string | null;
    name?: string | null;
    address?: string | null;
    location?: string | null;
    businessName?: string | null;
    businessType?: string | null;
    businessLocation?: string | null;
  } | null;
  governmentProfile?: {
    fullName?: string | null;
    name?: string | null;
    ministryName?: string | null;
    organizationName?: string | null;
    address?: string | null;
    location?: string | null;
    ministryAddress?: string | null;
    governmentAddress?: string | null;
  } | null;
  profile?: {
    dateOfBirth?: string | null;
    placeOfBirth?: string | null;
    farmName?: string | null;
    farmLocation?: string | null;
    farmSize?: string | number | null;
    businessName?: string | null;
    businessType?: string | null;
    businessAddress?: string | null;
    ministryName?: string | null;
    address?: string | null;
    bakongAccountId?: string | null;
  } | null;
  address?: string | null;
  fullAddress?: string | null;
  location?: string | null;
  farmLocation?: string | null;
  farmSize?: string | number | null;
  businessName?: string | null;
  businessType?: string | null;
  businessLocation?: string | null;
  ministryName?: string | null;
  ministryAddress?: string | null;
  organizationName?: string | null;
  governmentAddress?: string | null;
}

export interface UsersResponse {
  status: number;
  message: string;
  payload:
    | User[]
    | {
        content?: User[];
        data?: User[];
        items?: User[];
        users?: User[];
        pagination?: {
          page?: number;
          size?: number;
          totalElements?: number;
          totalItems?: number;
          totalPages?: number;
        };
        totalElements?: number;
        totalItems?: number;
        total?: number;
        count?: number;
        page?: number;
        size?: number;
      };
  totalElements?: number;
  totalItems?: number;
  total?: number;
  count?: number;
  success: boolean;
  timestamp: string;
}

export interface UserManagementStats {
  activeBans: number;
  appealsPending: number;
  avgResponseTimeDays: number;
  monthlyGrowthPercentage: number;
  pendingUsers: number;
  totalBuyers: number;
  totalFarmers: number;
  totalUsers: number;
}

export interface UserManagementStatsResponse {
  status: number;
  message: string;
  payload: UserManagementStats;
  success: boolean;
  timestamp: string;
}

export interface VerificationStats {
  awaitReviews: number;
  rejectedRequests: number;
  totalVerified: number;
}

export interface VerificationStatsResponse {
  status: number;
  message: string;
  payload: VerificationStats;
  success: boolean;
  timestamp: string;
}

export interface PaginatedUsers {
  users: User[];
  totalItems: number;
  page: number;
  size: number;
}

export interface UserResponse {
  status: number;
  message: string;
  payload: User;
  success: boolean;
  timestamp: string;
}

export interface UpdateUserStatusResponse {
  status: number;
  message: string;
  payload?: User;
  success: boolean;
  timestamp: string;
}
