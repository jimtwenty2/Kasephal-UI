type CurrencyToggleProps = {
  value: "KHR" | "USD";
  onChange: (value: "KHR" | "USD") => void;
};

export function CurrencyToggle({ value, onChange }: CurrencyToggleProps) {
  return (
    <div>
      <div className="flex h-12 rounded-xl border border-gray-200 bg-white p-1">
        {/* KHR */}
        <button
          type="button"
          onClick={() => onChange("KHR")}
          className={`flex-1 rounded-lg text-[14px] font-semibold transition ${
            value === "KHR" ? "bg-primary text-white" : "text-description-text hover:bg-gray-50"
          }`}
        >
          KHR
        </button>

        {/* USD */}
        <button
          type="button"
          onClick={() => onChange("USD")}
          className={`flex-1 rounded-lg text-[14px] font-semibold transition ${
            value === "USD" ? "bg-primary text-white" : "text-description-text hover:bg-gray-50"
          }`}
        >
          USD
        </button>
      </div>
    </div>
  );
}
