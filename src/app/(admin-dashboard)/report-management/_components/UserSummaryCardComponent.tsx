"use client";

import { useState } from "react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import UserSummaryModal from "./UserSummaryModalComponent";
import AdminAvatar from "../../_components/AdminAvatar";

export interface UserSummary {
  user_id: string;
  full_name: string;
  role: string;
  trusted_score: number;
  verified: boolean;
  avatar_url?: string;
}

// Full profile resolved from the role-specific profile (farmer/buyer/government)
// joined with the account record. Superset of UserSummary; the card renders the
// summary fields, the popup renders everything available.
export interface UserDetail extends UserSummary {
  // account
  email: string;
  phone_number: string;
  account_status: string;
  bio?: string;
  // shared profile
  date_of_birth?: string;
  place_of_birth?: string;
  profile_status?: string;
  // farmer
  farm_location?: string;
  farm_size?: number;
  medal_type?: string;
  trust_level?: string;
  // buyer
  business_type?: string;
  business_name?: string;
  business_address?: string;
  // government
  ministry_address?: string;
}

interface UserSummaryCardProps {
  label: "Reporter" | "Reported";
  user: UserDetail;
}

function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export default function UserSummaryCard({ label, user }: UserSummaryCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
        {label}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <AdminAvatar
          src={user.avatar_url}
          name={user.full_name}
          sizeClassName="h-10 w-10"
          textClassName="text-sm"
          imageSizes="40px"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-stone-900">
              {user.full_name}
            </p>
            {user.verified && (
              <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            )}
          </div>
          <p className="text-xs text-stone-500">
            {roleLabel(user.role)}
            {user.role.toUpperCase() === "FARMER" && (
              <> · Trusted Score: {user.trusted_score}</>
            )}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="mt-3 w-full rounded-lg border border-stone-200 bg-white py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
      >
        View Details
      </button>

      <UserSummaryModal
        open={detailsOpen}
        label={label}
        user={user}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}
