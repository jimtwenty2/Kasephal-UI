export interface ForgotPasswordResponse {
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
}
