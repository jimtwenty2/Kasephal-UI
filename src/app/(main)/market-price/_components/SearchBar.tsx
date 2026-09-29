"use client";

import { useMarketPriceText } from "./marketPriceText";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t, fontClass } = useMarketPriceText();

  return (
    <div className={`flex flex-col gap-1 ${fontClass}`}>
      <label className="text-[16px] font-light uppercase tracking-widest text-muted">
        {t("market.search")}
      </label>
      <div className="relative w-[450px] ">
        <input
          type="text"
          placeholder={t("market.search.crop.placeholder")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-[18px] w-full bg-[#ffffff] border border-border h-12.5 rounded-2xl px-4 py-2.5 pr-10 text-sm text-secondary-body placeholder-description-text focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus/20 transition-colors font-light"
        />
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>
  );
}