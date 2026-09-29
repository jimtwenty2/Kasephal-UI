"use client";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { mockChartDataByRange } from "./../../../data/adminData";
import type { TransactionData } from "./../../../types/adminType";
import CurrencyText from "../_components/CurrencyText";

type TransactionChartProps = {
  chartDataByRange?: Record<string, TransactionData>;
};

const formatFullCurrency = (value: number, currency: "USD" | "KHR" = "USD") => {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency === "USD" ? 2 : 0,
    maximumFractionDigits: currency === "USD" ? 2 : 0,
  }).format(Number.isFinite(value) ? value : 0);

  return currency === "KHR" ? `៛${formatted}` : `$${formatted}`;
};

export default function TransactionChart({
  chartDataByRange = mockChartDataByRange,
}: TransactionChartProps) {
  const [activeRange, setActiveRange] = useState<string>("6 Mo");
  const currentData: TransactionData = chartDataByRange[activeRange] || {
    totalVolume: 0,
    totalVolumeUsd: 0,
    totalVolumeKhr: 0,
    actionableVolume: 0,
    actionableVolumeUsd: 0,
    actionableVolumeKhr: 0,
    points: [],
  };
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-800">
            Transaction Volume
          </h2>

          <p className="mt-6 text-sm font-medium text-description-text">
            Total Volume
          </p>

          <h3 className="break-words text-2xl font-bold leading-tight text-slate-800">
            {formatFullCurrency(currentData.totalVolumeUsd ?? 0, "USD")}
          </h3>
          <h3 className="break-words text-lg font-bold leading-tight text-secondary">
            <CurrencyText text={formatFullCurrency(currentData.totalVolumeKhr ?? 0, "KHR")} />
          </h3>
        </div>

        <div className="min-w-0">
          <div className="mb-5 flex w-fit max-w-full flex-wrap rounded-full bg-[#F7F5F0] p-1 text-sm font-medium">
            {["Month", "3 Mo", "6 Mo", "Year"].map((item) => (
              <button
                key={item}
                onClick={() => setActiveRange(item)}
                className={`cursor-pointer rounded-full px-4 py-1.5 font-semibold transition ${
                  item === activeRange
                    ? "bg-white text-[#107446] shadow-sm"
                    : "text-slate-500 hover:text-[#107446]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="rounded-xl bg-[#FBF3E7] px-5 py-4">
            <p className="text-sm font-bold uppercase text-primary">
              Actionable Volume
            </p>
            <h3 className="break-words text-xl font-bold leading-tight text-primary">
              {formatFullCurrency(currentData.actionableVolumeUsd ?? 0, "USD")}
            </h3>
            <h3 className="break-words text-base font-bold leading-tight text-secondary">
              <CurrencyText text={formatFullCurrency(currentData.actionableVolumeKhr ?? 0, "KHR")} />
            </h3>
          </div>
        </div>
      </div>

      <div className="mb-1 flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full bg-[#107446]" /> USD
        </span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span className="h-2.5 w-2.5 rounded-full bg-[#f9c156]" /> KHR
        </span>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData.points}>
            <defs>
              <linearGradient id="volumeUsdFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#107446" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#107446" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="volumeKhrFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f9c156" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f9c156" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} stroke="#EFEFEF" />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#475467", fontWeight: 700 }}
            />

            <YAxis yAxisId="usd" hide domain={["dataMin - 1", "dataMax + 1"]} />
            <YAxis
              yAxisId="khr"
              orientation="right"
              hide
              domain={["dataMin - 1", "dataMax + 1"]}
            />

            <Area
              yAxisId="usd"
              type="monotone"
              dataKey="volumeUsd"
              stroke="#107446"
              strokeWidth={3}
              fill="url(#volumeUsdFill)"
              dot={false}
            />
            <Area
              yAxisId="khr"
              type="monotone"
              dataKey="volumeKhr"
              stroke="#f9c156"
              strokeWidth={3}
              fill="url(#volumeKhrFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}