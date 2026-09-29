"use client";

import dynamic from "next/dynamic";
import { AdminChartSkeleton } from "../_components/AdminLoading";

const TransactionChart = dynamic(() => import("./TransactionChart"), {
  ssr: false,
  loading: () => <AdminChartSkeleton className="h-[405px]" />,
});

export default function TransactionChartClient() {
  return <TransactionChart />;
}
