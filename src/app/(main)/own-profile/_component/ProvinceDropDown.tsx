"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";

type ProvinceDropdownProps = {
  label: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function ProvinceDropdown({
  label,
  options = [],
  selected,
  onChange,
  error,
}: ProvinceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);

  useDismissibleDropdown({
    open: isOpen,
    containerRef: dropdownRef,
    onClose: closeDropdown,
  });

  return (
    <div ref={dropdownRef} className="relative flex w-full flex-col">
      <label className="mb-2 block text-[14px] font-bold text-primary">
        <span className="mr-1 text-red-500">*</span>
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-12 w-full items-center justify-between rounded-4xl border bg-white px-4 transition-all outline-none text-left ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-light-grey hover:border-primary/40 focus:border-primary"
        }`}
      >
        <span className="text-[14px] font-medium text-primary-heading truncate">
          {selected || `Select ${label.toLowerCase()}`}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#9AA3AD] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-19.5 z-50 w-full rounded-[14px] border border-light-grey bg-white p-2 shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className={`flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                selected === ""
                  ? "bg-primary/10 text-primary"
                  : "text-[#9AA3AD] hover:bg-light-grey"
              }`}
            >
              Select {label.toLowerCase()}
            </button>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option); // Updates react-hook-form value
                  setIsOpen(false);
                }}
                className={`flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  selected === option
                    ? "bg-primary/10 text-primary"
                    : "text-secondary-body hover:bg-light-grey"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-[12px] font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
