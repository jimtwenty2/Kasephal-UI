"use client";

import dynamic from "next/dynamic";
import { AdminChartSkeleton } from "../_components/AdminLoading";
import type {
  AdminEscrowPeriod,
  AdminEscrowTimelinePoint,
} from "@/types/admin/escrow";

const EscrowOverviewChart = dynamic(() => import("./OverviewEscrow"), {
  ssr: false,
  loading: () => <AdminChartSkeleton className="h-full min-h-[300px]" />,
});

const TotalContractsChart = dynamic(() => import("./TotalContract"), {
  ssr: false,
  loading: () => <AdminChartSkeleton className="h-full min-h-[300px]" />,
});

interface EscrowChartsProps {
  period: AdminEscrowPeriod;
  timeline: AdminEscrowTimelinePoint[];
  totalContracts: number;
  onPeriodChange: (period: AdminEscrowPeriod) => void;
}

export default function EscrowCharts({
  period,
  timeline,
  totalContracts,
  onPeriodChange,
}: EscrowChartsProps) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] items-stretch">
      <div className="h-full">
        <EscrowOverviewChart
          period={period}
          timeline={timeline}
          onPeriodChange={onPeriodChange}
        />
      </div>
      <div className="h-full">
        <TotalContractsChart totalContracts={totalContracts} />
      </div>
    </section>
  );
}
