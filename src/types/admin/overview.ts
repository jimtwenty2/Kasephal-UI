import type {
  Activity,
  FinancialSummary,
  OverviewStat,
  TransactionData,
} from "@/types/adminType";

export type AdminOverviewPeriod =
  | "MONTH"
  | "THREE_MONTHS"
  | "SIX_MONTHS"
  | "YEAR";

export interface AdminOverviewStats {
  registeredUsers: number;
  activeUsers: number;
  activeUserRate: number;
  pendingVerify: number;
  contracts: number;
  activeContracts: number;
  completedContracts: number;
}

export interface AdminOverviewApiContractSummary {
  total: number;
  active: number;
  completed: number;
}

export interface AdminOverviewApiEscrowSummary {
  totalHolding: number | string;
  totalHoldingUsd: number | string;
  totalHoldingKhr: number | string;
  availableLiquidity: number | string;
  availableLiquidityUsd: number | string;
  availableLiquidityKhr: number | string;
}

export interface AdminOverviewApiMonthlyVolumeItem {
  month: string;
  volume: number | string;
  volumeUsd: number | string;
  volumeKhr: number | string;
}

export interface AdminOverviewApiTransactionVolume {
  period: AdminOverviewPeriod;
  totalVolume: number | string;
  totalVolumeUsd: number | string;
  totalVolumeKhr: number | string;
  actionableVolume: number | string;
  actionableVolumeUsd: number | string;
  actionableVolumeKhr: number | string;
  monthlyVolumes: AdminOverviewApiMonthlyVolumeItem[];
}

export interface AdminOverviewApiActivityItem {
  activityType: "ID_VERIFICATION" | "ESCROW_RELEASE" | "DISPUTE_RAISED";
  title: string;
  detail: string;
  amount: number | string | null;
  userLabel: string | null;
  createdAt: string;
  actionLabel: string;
  referenceId: string;
  referenceType: "IDENTITY_DOCUMENT" | "PAYMENT_REQUEST" | "REPORT_ISSUE";
}

export interface AdminOverviewApiPayload {
  registeredUsers: number;
  activeUsers: number;
  activeUserRate: number;
  pendingVerification: number;
  contracts: AdminOverviewApiContractSummary;
  escrow: AdminOverviewApiEscrowSummary;
  transactionVolume: AdminOverviewApiTransactionVolume;
  recentActivities: AdminOverviewApiActivityItem[];
}

export interface AdminOverview {
  stats: AdminOverviewStats;
  statCards: OverviewStat[];
  financials: FinancialSummary;
  chartDataByRange: Record<string, TransactionData>;
  recentActivities: Activity[];
}

export interface AdminOverviewApiResponse {
  success: boolean;
  status: number;
  message: string;
  payload: AdminOverviewApiPayload;
  timestamp: string;
}
