
export type RegisterRole = "BUYER" | "FARMER";

export interface AccountCreationRequest {
  identifier: string;
  password: string;
  confirmPassword: string;
  role: RegisterRole;
}

export interface AccountCreationResponse {
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
  payload?: AccountCreationPayload;
}

export interface AccountCreationPayload {
  profileSetupToken?: string;
  requiresProfileSetup?: boolean;
  nextStep?: number;
  registrationStep?: string;
  setupStage?: string;
  status?: string;
  profileSetupCompleted?: boolean;
  identityVerificationRequired?: boolean;
}

export interface FarmerProfileSetupRequest {
  fullName: string;
  dateOfBirth: string;
  placeOfBirthProvinceId: string;
  farmProvinceId: string;
  farmDistrictId: string;
  farmCommuneId: string | null;
  farmVillageId: string | null;
  farmName: string;
  farmSize: number;
  profileUrl: string | null;
}

export interface BuyerProfileSetupRequest {
  fullName: string;
  dateOfBirth: string;
  placeOfBirthProvinceId: string;

  businessProvinceId: string;
  businessDistrictId: string;
  businessCommuneId: string | null;
  businessVillageId: string | null;

  businessName: string;
  businessType: string;
  profileUrl: string | null;
}

export interface ProfileSetupResponse {
  message: string;
  success: boolean;
  timestamp: string;
}
