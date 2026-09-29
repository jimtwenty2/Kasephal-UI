"use client";

import { useMarketPriceText } from "./marketPriceText";

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function FilterDropDown({
  label,
  value,
  options,
  onChange,
}: FilterDropdownProps) {
  const { t, fontClass } = useMarketPriceText();

  return (
    <div className={`flex flex-col gap-1 ${fontClass}`}>
      {/* Label */}
      <label className="text-[16px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </label>

      {/* Dropdown wrapper */}
      <div className="group relative ">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            backgroundColor: "#ffffff",
          }}
          className="
            w-full
            cursor-pointer
            appearance-none
            rounded-[10px]
            border border-border 
            h-13.75
            bg-white
            px-4
            pr-10
            text-[14px]
            font-medium
            text-secondary-body
            outline-none
            transition-all
            duration-200
            hover:border-[#B8C4D0]
            hover:bg-[#dcf7dc]
            focus:border-primary
            focus:bg-white
            focus:ring-2
            focus:ring-primary/10
          "
        >
          <option
            value=""
            className="bg-white text-secondary-body"
          >
            {t("market.select")}
          </option>

          {options.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-white text-secondary-body"
            >
              {opt}
            </option>
          ))}
        </select>

        {/* Arrow icon */}
        <svg
          className="
            pointer-events-none
            absolute
            right-4
            top-1/2
            h-4
            w-4
            -translate-y-1/2
            text-muted
            transition-colors
            duration-200
            group-hover:text-primary
          "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}