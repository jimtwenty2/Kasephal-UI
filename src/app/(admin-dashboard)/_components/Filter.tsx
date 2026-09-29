import React from "react";
import type { ReactNode } from "react";
import { Plus, Search } from "lucide-react";
import { Tab } from "../../../types/adminType";

interface FilterProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlacement?: "below" | "right";
}

const Filter: React.FC<FilterProps> = ({
  tabs,
  activeTab,
  onTabChange,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  searchQuery,
  onSearchChange,
  searchPlacement = "below",
}) => {
  const searchInput = onSearchChange ? (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-description-text"
      />
      <input
        type="text"
        value={searchQuery ?? ""}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search..."
        className="w-full max-w-sm pl-10 pr-4 py-2.5 rounded-full border border-slate-200 sub-title text-primary-heading placeholder:text-description-text focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
      />
    </div>
  ) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {/* Tabs */}
        <div className="inline-flex p-1 bg-[#F5F8F5] rounded-full gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                }}
                className={`flex items-center cursor-pointer gap-2 px-4 py-2 sub-title font-medium rounded-full transition-all ${
                  isActive
                    ? "bg-white text-primary-heading shadow-sm"
                    : "text-description-text hover:text-primary-heading"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {searchPlacement === "right" && searchInput}

        {/* Button */}
        {searchPlacement !== "right" && buttonLabel && (
          <button
            onClick={onButtonClick}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 sub-title font-semibold text-white transition hover:bg-[#0d633c]"
          >
            {buttonIcon ?? <Plus size={16} />}
            {buttonLabel}
          </button>
        )}
      </div>

      {/* Search — only shown when onSearchChange is provided */}
      {searchPlacement === "below" && searchInput}
    </div>
  );
};

export default Filter;
