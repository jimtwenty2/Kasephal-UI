export type VerifyOtpRequest = {
  identifier: string;
  code: string;
};

export type VerifyOtpResponse = {
  status: number;
  message: string;
  payload: {
    requiresProfileSetup: boolean;
    profileSetupToken: string;
  };
  success: boolean;
  timestamp: string;
};

export type ResendOtpRequest = {
  identifier: string;
};

export type ResendOtpResponse = {
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
};

export type VerifyForgotPasswordOtpResponse = {
  status: number;
  message: string;
  success: boolean;
  timestamp: string;
};
