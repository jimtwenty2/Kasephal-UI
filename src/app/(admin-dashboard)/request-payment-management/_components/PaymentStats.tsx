import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  iconBg: string;
  accent?: boolean;
}

function StatCard({ label, value, icon, iconBg, accent = false }: StatCardProps) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl  bg-white px-5 py-4 shadow-sm ${
        accent ? "border-red-200" : "border-stone-200"
      }`}
    >
      <div className={`flex h-15 w-15 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className={`sub-title ${accent ? "text-red-600" : "text-stone-500"}`}>
          {label}
        </p>
        <p className="heading text-stone-900">{value}</p>
      </div>
    </div>

    
  );
}

interface PaymentStatsProps {
  paid: number;
  pending: number;
  rejected: number;
}

export default function PaymentStats({
  paid,
  pending,
  rejected,
}: PaymentStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Paid"
        value={paid.toLocaleString()}
        iconBg="bg-[rgba(236,253,245,1)]"
        icon={<CheckCircleIcon className="h-8 w-8 text-[rgba(43,127,255,1)]" />}
      />
      <StatCard
        label="Pending"
        value={pending.toLocaleString()}
        iconBg="bg-amber-50"
        icon={<ClockIcon className="h-8 w-8 text-amber-500" />}
      />
      <StatCard
        label="Rejected Request"
        value={rejected.toLocaleString()}
        accent={rejected > 0}
        iconBg="bg-red-50"
        icon={<XCircleIcon className="h-8 w-8 text-red-500" />}
      />
    </div>
  );
}
