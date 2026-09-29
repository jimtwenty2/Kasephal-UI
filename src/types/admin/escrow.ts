export type AdminEscrowStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AdminEscrowPeriod = "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";

export interface AdminEscrowPagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type AdminEscrowCurrency = "USD" | "KHR";

export interface AdminEscrowTimelinePoint {
  label: string;
  amount: number | string;
  amountUsd: number | string;
  amountKhr: number | string;
}

export interface AdminEscrowListItem {
  escrowId: string;
  escrowCode: string | null;
  orderId: string;
  orderCode: string | null;
  amount: number | string;
  currencyCode: AdminEscrowCurrency;
  status: AdminEscrowStatus;
  createdAt: string;
}

export interface AdminEscrowManagement {
  totalEscrowHold: number | string;
  totalEscrowHoldUsd: number | string;
  totalEscrowHoldKhr: number | string;
  totalContracts: number;
  period: AdminEscrowPeriod;
  timeline: AdminEscrowTimelinePoint[];
  items: AdminEscrowListItem[];
  pagination: AdminEscrowPagination;
}

export interface AdminEscrowManagementParams {
  status?: AdminEscrowStatus;
  period?: AdminEscrowPeriod;
  page?: number;
  size?: number;
}

export interface AdminEscrowManagementApiResponse {
  success: boolean;
  status: number;
  message: string;
  payload: AdminEscrowManagement;
  timestamp: string;
}
