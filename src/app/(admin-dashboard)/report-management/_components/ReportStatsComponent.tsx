
import {
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  accent?: boolean;
}

function StatCard({ label, value, icon, iconBg, iconColor, accent = false }: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl  bg-white px-5 py-4 shadow-md ${
        accent ? "border-red-200" : "border-stone-200"
      }`}
    >
      <div
        className={`flex h-15 w-15 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <div className={`h-8 w-8 ${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p
          className={`sub-title font-medium ${
            accent ? "text-red-500" : "text-stone-500"
          }`}
        >
          {label}
        </p>
        <p className="heading font-bold text-stone-900">{value}</p>
      </div>
    </div>
  );
}

interface ReportStatsProps {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function ReportStats({
  total,
  pending,
  approved,
  rejected,
}: ReportStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Reports"
        value={total.toLocaleString()}
        iconBg="bg-blue-50"
        iconColor="text-blue-400"
        icon={<DocumentTextIcon />}
      />
      <StatCard
        label="Pending Review"
        value={pending.toLocaleString()}
        iconBg="bg-blue-50"
        iconColor="text-blue-400"
        icon={<ClockIcon />}
        accent={pending > 0}
      />
      <StatCard
        label="Approved"
        value={approved.toLocaleString()}
        iconBg="bg-amber-50"
        iconColor="text-amber-400"
        icon={<CheckCircleIcon />}
      />
      <StatCard
        label="Rejected"
        value={rejected.toLocaleString()}
        iconBg="bg-red-50"
        iconColor="text-red-400"
        icon={<XCircleIcon />}
      />
    </div>
  );
}