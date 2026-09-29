"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type {
  AdminEscrowPeriod,
  AdminEscrowTimelinePoint,
} from "@/types/admin/escrow";
import AdminDropdown from "../_components/AdminDropdown";
import { formatCurrency } from "./_utils/formatCurrency";

const chartConfig = {
  amountUsd: {
    label: "USD Volume",
    color: "#107446",
  },
  amountKhr: {
    label: "KHR Volume",
    color: "#f9c156",
  },
};

const PERIOD_LABELS: Record<AdminEscrowPeriod, string> = {
  THIS_WEEK: "This Week",
  THIS_MONTH: "This Month",
  THIS_YEAR: "This Year",
};

const PERIOD_OPTIONS = Object.entries(PERIOD_LABELS).map(([value, label]) => ({
  value: value as AdminEscrowPeriod,
  label,
}));

interface EscrowOverviewChartProps {
  period: AdminEscrowPeriod;
  timeline: AdminEscrowTimelinePoint[];
  onPeriodChange: (period: AdminEscrowPeriod) => void;
}

function toNumber(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function compactAxis(value: number, currency: "USD" | "KHR") {
  if (value === 0) return "0";
  const symbol = currency === "USD" ? "$" : "៛";
  if (Math.abs(value) >= 1_000_000) return `${symbol}${value / 1_000_000}M`;
  if (Math.abs(value) >= 1_000) return `${symbol}${value / 1_000}K`;
  return `${symbol}${value}`;
}

export default function EscrowOverviewChart({
  period,
  timeline,
  onPeriodChange,
}: EscrowOverviewChartProps) {
  const chartData = timeline.map((point) => ({
    label: point.label,
    amountUsd: toNumber(point.amountUsd ?? point.amount),
    amountKhr: toNumber(point.amountKhr),
  }));

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold tracking-wide text-primary-heading">
            Escrow Overview
          </h3>
          <p className="mt-0.5 text-[13px] font-medium text-description-text">
            Performance timeline visualization
          </p>
        </div>

        <AdminDropdown
          value={period}
          options={PERIOD_OPTIONS}
          onChange={onPeriodChange}
          className="w-36"
          triggerClassName="h-9 bg-slate-50 px-3"
        />
      </div>

      {/* Legend: one series per currency */}
      <div className="mb-1 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-description-text">
          <span className="h-2.5 w-2.5 rounded-full bg-[#107446]" /> USD
        </span>
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-description-text">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f9c156]" /> KHR
        </span>
      </div>

      <div className="mt-2 h-50 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="escrowUsdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#107446" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#107446" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="escrowKhrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f9c156" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f9c156" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="#f1f5f9"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                yAxisId="usd"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#107446", fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => compactAxis(Number(value), "USD")}
              />
              <YAxis
                yAxisId="khr"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#f9c156", fontSize: 10, fontWeight: 600 }}
                tickFormatter={(value) => compactAxis(Number(value), "KHR")}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const isKhr = String(name).toLowerCase().includes("khr");
                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {isKhr ? "KHR" : "USD"}
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {formatCurrency(Number(value), isKhr ? "KHR" : "USD")}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Area
                yAxisId="usd"
                type="monotone"
                dataKey="amountUsd"
                stroke="#107446"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#escrowUsdGradient)"
              />
              <Area
                yAxisId="khr"
                type="monotone"
                dataKey="amountKhr"
                stroke="#f9c156"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#escrowKhrGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
