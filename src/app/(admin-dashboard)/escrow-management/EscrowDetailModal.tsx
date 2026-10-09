"use client";

import { useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { formatAdminId } from "@/utils/formatAdminId";
import type { AdminEscrowListItem } from "@/types/admin/escrow";
import { formatCurrency } from "./_utils/formatCurrency";

interface EscrowDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AdminEscrowListItem | null;
}

function formatDate(value?: string | null) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-0.5">
      <span className="font-medium text-description-text">{label}</span>
      <span
        className={`text-right text-slate-800 ${strong ? "font-bold" : "font-semibold"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function EscrowDetailModal({
  isOpen,
  onClose,
  data,
}: EscrowDetailModalProps) {
  useBodyScrollLock(isOpen && !!data);

  useEffect(() => {
    if (!isOpen || !data) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, data, onClose]);

  if (!isOpen || !data) return null;

  const statusBadgeColors = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close escrow details"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-50 px-6 pb-4 pt-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Escrow Details - {formatAdminId("ESC", data.escrowId)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 text-sm md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h3 className="mb-1 text-base font-bold text-slate-800">
              Transaction Report
            </h3>
            <span className="font-semibold text-slate-800">
              {formatDate(data.createdAt)}
            </span>

            <InfoRow label="Escrow ID" value={formatAdminId("ESC", data.escrowId)} />
            <InfoRow label="Order ID" value={formatAdminId("ORD", data.orderId)} />
            <InfoRow
              label="Amount"
              value={formatCurrency(data.amount, data.currencyCode)}
              strong
            />
            <InfoRow label="Currency" value={data.currencyCode} />
            <div className="flex items-center justify-between gap-4 py-0.5">
              <span className="font-medium text-description-text">Status</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusBadgeColors[data.status]}`}
              >
                {data.status}
              </span>
            </div>
            <InfoRow label="Date" value={formatDate(data.createdAt)} />
          </div>

          <div className="flex flex-col">
            <h3 className="mb-4 text-base font-bold text-slate-800">
              Payment Date
            </h3>
            <div className="relative ml-1 space-y-6 border-l-2 border-slate-100 pl-5">
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <h4 className="font-bold leading-none text-primary-heading">
                  Escrow Created
                </h4>
                <p className="mt-1 text-xs font-medium text-description-text">
                  {formatDate(data.createdAt)}
                </p>
              </div>
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <h4 className="font-bold leading-none text-slate-800">
                  Payment Received
                </h4>
                <p className="mt-1 text-xs font-medium text-description-text">
                  {formatDate(data.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
