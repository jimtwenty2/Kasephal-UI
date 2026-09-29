import React from "react";
import { VariantType } from "../../../types/adminType";

interface RoleStatusProps {
  label: string;
  variant: VariantType;
}

const RoleStatus: React.FC<RoleStatusProps> = ({ label, variant }) => {
  const styles: Record<VariantType, string> = {
    buyer: "bg-[#FFFBEB] text-[#BB4D00] border border-[#FEE685]",
    farmer: "bg-[#ECFDF5] text-[#007A55] border border-[#A4F4CF]",
    government: "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]",
    active: "bg-[#10B9811A] text-[#10B981] font-semibold",
    banned: "bg-[#EF44441A] text-[#EF4444] font-semibold",
    suspend: "bg-[#F59E0B1A] text-[#F59E0B] font-semibold",
    suspended: "bg-[#F59E0B1A] text-[#F59E0B] font-semibold",
    draft: "bg-[#F59E0B1A] text-[#F59E0B] font-semibold",
    published: "bg-[#10B9811A] text-primary font-semibold",
  };

  return (
    <span
      className={`inline-block text-m font-medium px-2.5 py-0.5 rounded-full capitalize ${styles[variant] || ""}`}
    >
      {label}
    </span>
  );
};

export default RoleStatus;
