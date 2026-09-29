"use client";

export type CurrencyCode = "USD" | "KHR";

export const KHR_COLOR = "#F9C156";

type Props = {
  currency: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
};

export default function CurrencyToggle({ currency, onChange }: Props) {
  const isKHR = currency === "KHR";

  return (
    <div className="inline-flex shrink-0 rounded-xl border border-[#EAECF0] bg-[#F9FAFB] p-1">
      <button
        onClick={() => onChange("USD")}
        className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
          !isKHR
            ? "bg-white text-primary shadow-sm"
            : "text-[#667085] hover:text-[#344054]"
        }`}
      >
        $ USD
      </button>
      <button
        onClick={() => onChange("KHR")}
        style={isKHR ? { color: KHR_COLOR } : {}}
        className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-all ${
          isKHR ? "bg-white shadow-sm" : "text-[#667085] hover:text-[#344054]"
        }`}
      >
        ៛ KHR
      </button>
    </div>
  );
}
