export type LoginIdentifierPayload = {
  email: string | null;
  phoneNumber: string | null;
};

export type UpdateLoginIdentifierRequest = {
  identifier: string;
  code: string;
};

export type LoginIdentifierOtpPayload = {
  identifier: string;
};

export type ApiErrorResponse = {
  message?: string;
  detail?: string;
  title?: string;
  error?: string;
  errors?: Record<string, string | string[]>;
};

export type ApiResponse<T> = {
  status?: number;
  success?: boolean;
  message?: string;
  payload: T;
};
