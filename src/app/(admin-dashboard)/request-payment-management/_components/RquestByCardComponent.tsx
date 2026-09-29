"use client";

import { useState } from "react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

import type { AdminRequestPaymentRequester } from "@/types/admin/requestPayment";
import AdminAvatar from "../../_components/AdminAvatar";
import RequestByDetailModal from "./RequestByDetailModalComponent";

export default function RequestByCard({
  user,
}: {
  user: AdminRequestPaymentRequester;
}) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const roleLabel = user.role.charAt(0) + user.role.slice(1).toLowerCase();

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
        Request By
      </p>

      <div className="mt-3 flex items-center gap-3">
        <AdminAvatar
          src={user.profileUrl}
          name={user.name}
          sizeClassName="h-10 w-10"
          textClassName="text-sm"
          imageSizes="40px"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-stone-900">
              {user.name}
            </p>
            <CheckBadgeIcon className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          </div>
          <p className="text-xs text-stone-500">{roleLabel}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsDetailOpen(true)}
        className="mt-3 w-full rounded-lg border border-stone-200 bg-white py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
      >
        View Details
      </button>

      <RequestByDetailModal
        open={isDetailOpen}
        user={user}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
