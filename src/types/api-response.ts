export interface ApiResponse<T> {
  status: number;
  message: string;
  payload: T;
  success: boolean;
  timestamp: string;
}