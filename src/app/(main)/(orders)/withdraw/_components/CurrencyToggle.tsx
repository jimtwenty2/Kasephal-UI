"use client";

import type { RequestCurrency } from "@/utils/requestPaymentAmount";

const OPTIONS: RequestCurrency[] = ["USD", "KHR"];

type CurrencyToggleProps = {
  value: RequestCurrency;
  onChange: (currency: RequestCurrency) => void;
  disabled?: boolean;
};

export default function CurrencyToggle({
  value,
  onChange,
  disabled = false,
}: CurrencyToggleProps) {
  return (
    <div className="inline-flex rounded-xl border border-light-grey bg-[#F7F9FB] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option)}
          className={`rounded-lg px-4 py-1.5 text-[13px] font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            value === option
              ? "bg-primary text-white shadow-sm"
              : "text-secondary-body hover:text-primary-heading"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
