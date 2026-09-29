import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "",
  label = "",
}: SearchInputProps) {
  return (
    <div className="w-full">
      {/* Label */}
      {label ? (
        <label className="text-[16px] font-medium uppercase tracking-widest text-muted">
          {label}
        </label>
      ) : null}

      {/* Search Box */}
      <div
        className="flex w-full items-center rounded-[12px] border border-light-grey bg-white px-4 transition-all focus-within:border-primary focus-within:shadow-[0_0_0_2px_rgba(34,197,94,0.08)]"
        style={{ height: "46px" }}
      >
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[16px] font-medium text-dark-grey outline-none placeholder:text-muted"
        />

        <Search size={18} className="ml-2 shrink-0 text-muted" />
      </div>
    </div>
  );
}