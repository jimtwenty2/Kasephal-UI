import React from "react";
import { ReactNode } from "react";
export type RoleType = "buyer" | "farmer" | "government";
export type StatusType = "active" | "banned" | "suspend" | "suspended";
export type PolicyStatus = "published" | "draft";
export type VariantType = RoleType | StatusType | PolicyStatus;

export interface User {
  user_id: string;
  name: string;
  profile?: string;
  email: string;
  regDate: string;
  role: string;
  status: string;

  phone?: string;
  location?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;

  farmLocation?: string;
  farmSize?: string;

  companyName?: string;
  businessType?: string;

  organizationName?: string;
  address?: string;
}
export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}
export interface IdentityVerification {
  user_id: string;
  name: string;
  profile?: string;
  email: string;
  dob: string;
  address: string;
  document: string;
  role: string;
  submissionDate: string;
  document_back?: string;
  document_front: string;
}
export interface StatItem {
  id: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}
// export interface Policy {
//   id: string;
//   title: string;
//   description: string;
//   date: string;
//   status: string;
// }
export interface FinancialSummary {
  totalEscrowHolding: number;
  totalEscrowHoldingUsd?: number;
  totalEscrowHoldingKhr?: number;
  availableLiquidity: number;
  availableLiquidityUsd?: number;
  availableLiquidityKhr?: number;
}
export interface OverviewStat {
  title: string;
  value: string | number;
  topBorderColor?: string;

  progressBar?: {
    current: number;
    total: number;
    label: string;
  };
  linkAction?: {
    text: string;
    href: string;
  };
  subMetrics?: {
    active: string | number;
    completed: string | number;
  }
}
export interface Activity {
  id: string;
  icon?: ReactNode;
  iconType: "verification" | "escrow" | "dispute";
  iconClassName: string;
  type: string;
  name: string;
  subtitle: string;
  amount: string;
  amountClassName?: string;
  time: string;
  action: string;
}

export interface ChartPoint {
  month: string;
  volume: number;
  volumeUsd?: number;
  volumeKhr?: number;
}
export interface TransactionData {
  totalVolume: number;
  totalVolumeUsd?: number;
  totalVolumeKhr?: number;
  actionableVolume: number;
  actionableVolumeUsd?: number;
  actionableVolumeKhr?: number;
  points: ChartPoint[];
}
export interface EscrowTransaction {
  escrowId: string;
  orderId: string;
  paymentId: string;
  buyer: string;
  farmer: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
  date: string;
  escrowHoldDate: string;
  paymentDate: string | null;
  escrowCreated: string;
  paymentReceived: string | null;
}
