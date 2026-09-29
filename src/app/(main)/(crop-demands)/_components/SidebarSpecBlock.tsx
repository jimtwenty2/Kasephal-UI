import React from "react";

interface SpecProps {
  label: string;
  value: string;
  highlight?: boolean;
}

// Add the "export" keyword here
export function SidebarSpecBlock({ label, value, highlight = false }: SpecProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-150 pb-4 last:border-none">
      <span className="text-[14px] letter-spacing-[0.6px] leading-4 font-bold text-[#9CA3AF] uppercase tracking-widest font-thicccboi">
        {label}
      </span>
      <span className={`text-[20px] font-bold ${highlight ? "text-primary" : "text-[#2C2E33]"} font-thicccboi leading-6`}>
        {value}
      </span>
    </div>
  );
}