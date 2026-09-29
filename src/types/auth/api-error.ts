export interface ApiErrorResponse {
  detail: string;
  instance: string;
  status: number;
  title: string;
  timestamp: string;
  errors?: Record<string, string>;
  payload?: unknown;
}


export class ApiValidationError extends Error {
  errors?: Record<string, string>;
  payload?: unknown;
  data?: ApiErrorResponse;
  status?: number;

  constructor(errorData: ApiErrorResponse, fallback: string) {
    const validationMessage = errorData.errors
      ? Object.values(errorData.errors).join(", ")
      : errorData.detail || errorData.title || fallback;

    super(validationMessage);

    this.name = "ApiValidationError";
    this.errors = errorData.errors;
    this.payload = errorData.payload;
    this.data = errorData;
    this.status = errorData.status;
  }
}
