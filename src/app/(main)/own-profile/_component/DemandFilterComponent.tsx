"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useI18n } from "@/lib/i18n/I18nContext";

const PROFILE_TEXT = {
  "profile.body.search": { en: "SEARCH", kh: "ស្វែងរក" },
  "profile.body.search-label": { en: "Search crop name...", kh: "ស្វែងរកឈ្មោះដំណាំ..." },
} as const;

function getProfileText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    PROFILE_TEXT[key as keyof typeof PROFILE_TEXT]?.[lang] ?? key;
}


type FilterOption = {
  label: string;
  value: string;
};

type FilterDropdown = {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (value: string) => void;
};

type DemandFilterComponentProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterDropdown[];
};

function CustomFilterDropdown({
  label,
  options = [],
  selected,
  onChange,
}: FilterDropdown) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useMemo(() => [menuRef], []);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const selectedOption = options.find((option) => option.value === selected);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  useDismissibleDropdown({
    open: isOpen,
    containerRef: dropdownRef,
    additionalRefs: dropdownRefs,
    onClose: closeDropdown,
  });

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setMenuStyle({
      top: rect.bottom + window.scrollY + 6,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  const toggleDropdown = () => {
    if (!isOpen) updateMenuPosition();
    setIsOpen((prev) => !prev);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen, updateMenuPosition]);

  return (
    <div ref={dropdownRef} className="relative isolate flex w-full flex-col gap-1.5">
      <label className="text-[14px] uppercase tracking-widest text-muted">
        {label}
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className={`flex w-full cursor-pointer items-center justify-between rounded-3xl border bg-white px-4 text-left transition-all ${
          isOpen
            ? "border-primary shadow-[0_0_0_2px_rgba(34,197,94,0.08)]"
            : "border-light-grey hover:border-primary/40"
        }`}
        style={{ height: "46px" }}
      >
        <span className="truncate text-[14px] font-medium text-muted">
          {selectedOption?.label ?? selected}
        </span>

        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted"
          }`}
        />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              style={{
                position: "absolute",
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
              }}
              className="z-10000 rounded-3xl border border-light-grey bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="max-h-60 overflow-y-auto [scrollbar-width:thin]">
                {options.map((option) => {
                  const isSelected = selected === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center rounded-lg px-4 py-2.5 text-left text-[14px] font-medium transition-colors ${
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-secondary-body hover:bg-light-grey/50 hover:text-dark-grey"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export default function DemandFilterComponent({
  searchValue = "",
  onSearchChange = () => {},
  filters = [],
}: DemandFilterComponentProps) {
  const { language } = useI18n();
  const t = getProfileText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";
return (
    <div className={`mb-8 flex w-full flex-col gap-4 lg:flex-row lg:items-end ${fontClass}`}>
      <div className="flex w-full flex-col gap-1.5 lg:flex-4">
        <label className="text-[14px] uppercase text-muted">
          {t("profile.body.search")}
        </label>

        <div className="group relative flex h-11 items-center rounded-3xl border border-light-grey bg-white px-4 transition-all focus-within:border-primary focus-within:shadow-sm">
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("profile.body.search-label")}
            className="w-full bg-transparent pr-10 text-[15px] font-medium text-primary-heading outline-none placeholder:text-muted"
          />

          <Search className="absolute right-4 h-4 w-4 text-muted transition-colors group-focus-within:text-primary" />
        </div>
      </div>

      <div className="w-full lg:w-75">
        {filters.map((filter) => (
          <CustomFilterDropdown
            key={filter.label}
            label={filter.label}
            options={filter.options}
            selected={filter.selected}
            onChange={filter.onChange}
          />
        ))}
      </div>
    </div>
  );
}