"use client";

import { useState } from "react";
import { User } from "../../../types/adminType";
import { X } from "lucide-react";
import ManageStatus from "./ManageStatus";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatCambodiaPhone } from "@/utils/formatCambodiaPhone";
import AdminAvatar from "../_components/AdminAvatar";
interface UserDetailModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdateStatus?: (data: {
    userId: string;
    status: string;
    reason: string;
  }) => void;
}

export default function UserDetailModal({
  isOpen,
  user,
  onClose,
  onUpdateStatus,
}: UserDetailModalProps) {
  const [isManageStatusOpen, setIsManageStatusOpen] = useState(false);
  useBodyScrollLock(isOpen && !!user);

  if (!isOpen || !user) return null;

  const statusClass =
    user.status === "Active"
      ? "bg-[#10B9811A] text-[#10B981] font-semibold"
      : user.status === "Banned"
        ? "bg-[#EF44441A] text-[#EF4444] font-semibold"
        : "bg-[#F59E0B1A] text-[#F59E0B] font-semibold";

  const handleStatusSubmit = (data: {
    userId: string;
    status: string;
    reason: string;
  }) => {
    onUpdateStatus?.(data);
  };

  const role = user.role.toLowerCase();
  const contactNumber = formatCambodiaPhone(user.phone);
  const displayAddress = user.address ?? user.location ?? user.farmLocation;
  const farmLocation = user.farmLocation ?? user.location ?? user.address;
  const businessLocation = user.location ?? user.address;
  const organizationName = user.organizationName ?? user.name;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
        <div className="w-full max-w-[960px] overflow-hidden rounded-[24px] bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-150 px-8 py-5">
            <h2 className="title font-bold text-primary-heading">
              User Information
            </h2>

            <button
              onClick={onClose}
              className="rounded-full p-1 text-description transition-colors hover:bg-slate-100 hover:text-primary-heading"
            >
              <X size={22} />
            </button>
          </div>

          <div className="px-9 py-8">
            <div className="flex items-center gap-6">
              <div className="shrink-0 rounded-full border-4 border-slate-50 shadow-md">
                <AdminAvatar
                  src={user.profile}
                  name={user.name}
                  sizeClassName="h-[120px] w-[120px]"
                  textClassName="header"
                  imageSizes="120px"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="heading font-bold tracking-tight text-primary-heading">
                    {user.name}
                  </h3>

                  <span
                    className={`title flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${statusClass}`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.status}
                  </span>
                </div>

                <div className="subtitle flex items-center gap-4 font-medium text-[#949494]">
                  <span>{user.email}</span>
                  <span>Joined {user.regDate}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setIsManageStatusOpen(true)}
                    className="title rounded-full bg-primary px-5 py-2 font-bold text-white shadow-sm transition-all hover:bg-[#0d633c]"
                  >
                    Manage Status
                  </button>
                </div>
              </div>
            </div>

            <div className="my-8 h-px bg-slate-200" />

            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              <div>
                <SectionTitle title={`${user.role} Info`} />

                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                  <InfoItem label="FULL NAME" value={user.name} />
                  <InfoItem label="CONTACT NUMBER" value={contactNumber} />
                  <InfoItem label="DATE OF BIRTH" value={user.dateOfBirth} />
                  <InfoItem label="PLACE OF BIRTH" value={user.placeOfBirth} />
                  <InfoItem label="ADDRESS" value={displayAddress} />
                </div>
              </div>

              <div>
                {role === "farmer" && (
                  <>
                    <SectionTitle title="Farm Info" />

                    <div className="grid grid-cols-1 gap-y-6">
                      <InfoItem
                        label="FARM LOCATION"
                        value={farmLocation}
                      />
                      <InfoItem label="FARM SIZE" value={user.farmSize} />
                    </div>
                  </>
                )}

                {role === "government" && (
                  <>
                    <SectionTitle title="Organization Info" />

                    <div className="grid grid-cols-1 gap-y-6">
                      <InfoItem
                        label="ORGANIZATION NAME"
                        value={organizationName}
                      />
                      <InfoItem label="ADDRESS" value={displayAddress} />
                    </div>
                  </>
                )}

                {role === "buyer" && (
                  <>
                    <SectionTitle title="Business Info" />

                    <div className="grid grid-cols-1 gap-y-6">
                      <InfoItem label="COMPANY NAME" value={user.companyName} />
                      <InfoItem
                        label="BUSINESS TYPE"
                        value={user.businessType}
                      />
                      <InfoItem
                        label="BUSINESS LOCATION"
                        value={businessLocation}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ManageStatus
        isOpen={isManageStatusOpen}
        user={user}
        onClose={() => setIsManageStatusOpen(false)}
        onSubmit={handleStatusSubmit}
      />
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-5">
      <h4 className="title font-bold tracking-wide text-primary-heading">
        {title}
      </h4>
      <div className="mt-2 h-px w-full bg-slate-200" />
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  const displayValue =
    typeof value === "string" && value.trim() ? value.trim() : value;

  return (
    <div className="space-y-1">
      <p className=" uppercase text-[#949494]">{label}</p>
      <p className="break-words text-primary-heading">
        {displayValue || "N/A"}
      </p>
    </div>
  );
}
