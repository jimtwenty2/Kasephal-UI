import React from "react";

interface SmallStatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
}

const SmallStatCard: React.FC<SmallStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor 
}) => {
  return (
    <div className="flex items-center gap-5 p-6 bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full">
      <div className={`flex items-center justify-center w-14 h-14 rounded-full ${iconBgColor} ${iconColor}`}>
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <span className="title font-normal text-description-text tracking-wide">
          {title}
        </span>
        <span className="heading font-bold text-[#1e2d5a] tracking-tight">
          {value}
        </span>
      </div>
    </div>
  );
};

export default SmallStatCard;