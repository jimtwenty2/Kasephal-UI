"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import type { UserDetail } from "./UserSummaryCardComponent";
import { formatCambodiaPhone } from "@/utils/formatCambodiaPhone";
import AdminAvatar from "../../_components/AdminAvatar";

interface UserSummaryModalProps {
  open: boolean;
  label: "Reporter" | "Reported";
  user: UserDetail;
  onClose: () => void;
}

function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Formats a date of birth as "DD MMM, YYYY" (e.g. "05 Jun, 2026"). Returns the
// original value unchanged if it isn't a parseable date.
function formatDateOfBirth(value?: string): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  return `${day} ${month}, ${date.getFullYear()}`;
}

export default function UserSummaryModal({
  open,
  label,
  user,
  onClose,
}: UserSummaryModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const isFarmer = user.role.toUpperCase() === "FARMER";

  const rawFields: { label: string; value?: string | number }[] = [
    { label: "Account Status", value: titleCase(user.account_status) },
    { label: "Email", value: user.email },
    { label: "Phone", value: formatCambodiaPhone(user.phone_number) },
    { label: "Date of Birth", value: formatDateOfBirth(user.date_of_birth) },
    { label: "Place of Birth", value: user.place_of_birth },
    {
      label: "Profile Status",
      value: user.profile_status ? titleCase(user.profile_status) : undefined,
    },
    // Farmer
    { label: "Farm Location", value: user.farm_location },
    {
      label: "Farm Size",
      value: user.farm_size != null ? `${user.farm_size} ha` : undefined,
    },
    { label: "Trust Score", value: isFarmer ? user.trusted_score : undefined },
    {
      label: "Trust Level",
      value: user.trust_level ? titleCase(user.trust_level) : undefined,
    },
    {
      label: "Medal",
      value: user.medal_type ? titleCase(user.medal_type) : undefined,
    },
    // Buyer
    { label: "Business Type", value: user.business_type },
    { label: "Business Name", value: user.business_name },
    { label: "Business Address", value: user.business_address },
    // Government
    { label: "Address", value: user.ministry_address },
    { label: "Bio", value: user.bio },
  ];
  const fields = rawFields.filter(
    (f) => f.value !== undefined && f.value !== "",
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-summary-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between px-6 pb-2 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {label}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6 pt-2">
          <div className="flex flex-col items-center text-center">
            <AdminAvatar
              src={user.avatar_url}
              name={user.full_name}
              sizeClassName="h-20 w-20"
              textClassName="text-2xl"
              imageSizes="80px"
            />
            <div className="mt-3 flex items-center gap-1">
              <h2
                id="user-summary-title"
                className="text-lg font-bold text-stone-900"
              >
                {user.full_name}
              </h2>
              {user.verified && (
                <CheckBadgeIcon className="h-5 w-5 flex-shrink-0 text-emerald-600" />
              )}
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {roleLabel(user.role)}
            </p>
          </div>

          <dl className="mt-5 divide-y divide-stone-100 border-t border-stone-100 text-sm">
            {fields.map((f) => (
              <div
                key={f.label}
                className="flex items-start justify-between gap-4 py-2.5"
              >
                <dt className="flex-shrink-0 text-stone-500">{f.label}</dt>
                <dd className="break-words text-right font-medium text-stone-800">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
