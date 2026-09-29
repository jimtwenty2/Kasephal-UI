
export interface UpdateBakongRequest {
  bakongAccountId: string;
}

export type BakongUserRole = 'FARMER' | 'BUYER' | 'GOVERNMENT';

export interface UpdateBakongResponse {
  success: boolean;
  message?: string;
  data?: {
    bakongAccountId: string;
    [key: string]: any;
  };
}