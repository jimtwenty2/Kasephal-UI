type UnitToggleProps = {
  value: "KG" | "TON";
  onChange: (value: "KG" | "TON") => void;
};

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <div>
      <div className="flex h-12 rounded-xl border border-gray-200 bg-white p-1">
        {/* KG */}
        <button
          type="button"
          onClick={() => onChange("KG")}
          className={`flex-1 rounded-lg text-[14px] font-semibold transition ${
            value === "KG" ? "bg-primary text-white" : "text-description-text hover:bg-gray-50"
          }`}
        >
          KG
        </button>

        {/* TON */}
        <button
          type="button"
          onClick={() => onChange("TON")}
          className={`flex-1 rounded-lg text-[14px] font-semibold transition ${
            value === "TON" ? "bg-primary text-white" : "text-description-text hover:bg-gray-50"
          }`}
        >
          TON
        </button>
      </div>
    </div>
  );
}
