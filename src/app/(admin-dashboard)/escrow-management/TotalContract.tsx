"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const chartConfig = {
  contracts: {
    label: "Contracts",
  },
};

const MAX_CONTRACTS_FOR_FULL_CHART = 100;
const FULL_RING_DATA = [{ name: "Capacity", value: 1, fill: "#E7F2EC" }];

export default function TotalContractsChart({
  totalContracts,
}: {
  totalContracts: number;
}) {
  const fetchedTotalContracts = Math.max(
    0,
    Number.isFinite(totalContracts) ? totalContracts : 0,
  );
  const chartContracts = Math.min(
    fetchedTotalContracts,
    MAX_CONTRACTS_FOR_FULL_CHART,
  );
  const contractProgress = chartContracts / MAX_CONTRACTS_FOR_FULL_CHART;
  const progressEndAngle = 90 - contractProgress * 360;
  const contractPieData = [
    { name: "Contracts", contracts: fetchedTotalContracts, fill: "#107446" },
  ];

  return (
    <div className="flex h-full min-h-[300px] flex-col items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h3 className="mt-2 text-[16px] font-bold tracking-wide text-primary">
        Total Contracts
      </h3>
      <div className="relative flex w-full flex-1 items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={FULL_RING_DATA}
                dataKey="value"
                innerRadius={62}
                outerRadius={75}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {FULL_RING_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip
                cursor={false}
                content={(props) => {
                  const isContractSlice = props.payload?.some(
                    (item) => item.name === "Contracts",
                  );

                  if (!isContractSlice) return null;

                  return (
                    <div className="grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          Contracts
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {fetchedTotalContracts.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={contractPieData}
                dataKey="contracts"
                nameKey="name"
                innerRadius={62}
                outerRadius={75}
                stroke="none"
                startAngle={90}
                endAngle={progressEndAngle}
              >
                {contractPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      <div className="mt-3 text-center">
        <span className="text-[32px] font-extrabold tracking-tight text-primary-heading">
          {fetchedTotalContracts.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
