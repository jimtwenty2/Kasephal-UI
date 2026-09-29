import React from "react";
import { TrendingUp, Clock } from "lucide-react";

interface StatsCardProps {
  title: string;
  count: number | string;
  badgeText: string;
  badgeType?: "info" | "warning" | "banned";
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  badgeText,
  badgeType = "info",
}) => {
  const badgeStyles = {
    info: { className: "bg-emerald-50 text-emerald-600 title font-normal", icon: TrendingUp },
    warning: { className: "bg-amber-50 text-amber-700 title font-normal", icon: Clock },
    banned: { className: "bg-rose-50 text-rose-600 title font-normal", icon: Clock }
  };


  const currentBadge = badgeStyles[badgeType] || badgeStyles.info;
  const Icon = currentBadge.icon;

  return (
    <div className="flex-1 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-w-[240px]">
      <p className="title text-description-text mb-2">{title}</p>
      <h3 className="heading font-bold text-primary-heading mb-3">{count}</h3>
      
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs ${currentBadge.className}`}
      >
        <Icon size={18} className="shrink-0" />
        <span>{badgeText}</span>
      </span>
    </div>
  );
};

export default StatsCard;