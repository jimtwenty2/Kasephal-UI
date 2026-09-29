"use client";

import React, { useCallback, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | number)[];
  setCurrentPage: (page: number) => void;
}

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  setCurrentPage,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useDismissibleDropdown({
    open: isOpen,
    containerRef,
    onClose: closeDropdown,
  });

  return (
    <div ref={containerRef} className="relative isolate w-full">
      {/* Label */}
      <label className="text-[15px] font-medium uppercase tracking-widest text-muted">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between w-full bg-white border rounded-[12px] px-4 text-left transition-all ${
          isOpen
            ? "border-primary shadow-[0_0_0_2px_rgba(34,197,94,0.08)]"
            : "border-light-grey"
        }`}
        style={{ height: "46px" }}
      >
        <span className="truncate text-[16px] font-medium text-muted">
          {value === "All" ? `All` : value}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted"
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-[100] w-full rounded-[12px] border border-light-grey bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const optionStr = option.toString();
              return (
                <button
                  key={optionStr}
                  type="button"
                  onClick={() => {
                    onChange(optionStr);
                    setCurrentPage(1);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-[16px] font-medium transition-colors ${
                    value === optionStr
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-body hover:bg-light-grey/50 hover:text-dark-grey"
                  }`}
                >
                  {optionStr === "All" ? `All ${label}` : optionStr}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================================
// STYLED STATUS BADGE
// ==========================================================

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status?.toUpperCase() || "";

  const badgeStyles: Record<string, string> = {
    AVAILABLE: "bg-[#D1FAE5CC] text-green-800 border-green-200/40",
    UNAVAILABLE: "bg-[#FEE2E2CC] text-[#991B1B] border-red-200/40",
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    MATCHED: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]/60",
    CLOSED: "bg-rose-50 text-rose-700 border-rose-200/60",
  };

  const currentStyle = badgeStyles[normalizedStatus] || badgeStyles.AVAILABLE;

  return (
    <span
      className={`mb-1 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${currentStyle}`}
    >
      {status}
    </span>
  );
}
