"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useI18n } from "@/lib/i18n/I18nContext";

export type FilterOption = string | { value: string; label: string };

const DROPDOWN_TEXT = {
  All: { en: "All", kh: "ទាំងអស់" },
  AVAILABLE: { en: "Available", kh: "មានស្តុក" },
  UNAVAILABLE: { en: "Unavailable", kh: "មិនមានស្តុក" },
  OPEN: { en: "Open", kh: "បើក" },
  MATCHED: { en: "Matched", kh: "បានផ្គូផ្គង" },
  CLOSED: { en: "Closed", kh: "បានបិទ" },
  APPLY: { en: "Apply", kh: "ដាក់ពាក្យ" },
  EXPIRED: { en: "Expired", kh: "ផុតកំណត់" },
  "Select an option": {
    en: "Select an option",
    kh: "ជ្រើសរើសជម្រើសមួយ",
  },
} as const;

const OPTION_TEXT = {
  RICE_CROPS: { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  FRUIT: { en: "Fruit", kh: "ផ្លែឈើ" },
  FRUITS: { en: "Fruits", kh: "ផ្លែឈើ" },
  FRUIT_CROPS: { en: "Fruit Crops", kh: "ដំណាំផ្លែឈើ" },
  VEGETABLE: { en: "Vegetable", kh: "បន្លែ" },
  VEGETABLES: { en: "Vegetables", kh: "បន្លែ" },
  LEGUMES: { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  HERBS: { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  SPICES: { en: "Spices", kh: "គ្រឿងទេស" },
  NUTS: { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  GRAIN: { en: "Grain", kh: "គ្រាប់ធញ្ញជាតិ" },
  GRAINS: { en: "Grains", kh: "គ្រាប់ធញ្ញជាតិ" },
  FIBER_CROP: { en: "Fiber Crop", kh: "ដំណាំសរសៃ" },
  FIBER_CROPS: { en: "Fiber Crops", kh: "ដំណាំសរសៃ" },
  ROOT_CROPS: { en: "Root Crops", kh: "ដំណាំមើម" },
  INDUSTRIAL_CROPS: { en: "Industrial Crops", kh: "ដំណាំឧស្សាហកម្ម" },
  CAMBODIA: { en: "Cambodia", kh: "កម្ពុជា" },
  BANTEAY_MEANCHEY: { en: "Banteay Meanchey", kh: "បន្ទាយមានជ័យ" },
  BATTAMBANG: { en: "Battambang", kh: "បាត់ដំបង" },
  KAMPONG_CHAM: { en: "Kampong Cham", kh: "កំពង់ចាម" },
  KAMPONG_CHHNANG: { en: "Kampong Chhnang", kh: "កំពង់ឆ្នាំង" },
  KAMPONG_SPEU: { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  KAMPONG_THOM: { en: "Kampong Thom", kh: "កំពង់ធំ" },
  KAMPOT: { en: "Kampot", kh: "កំពត" },
  KANDAL: { en: "Kandal", kh: "កណ្តាល" },
  KEP: { en: "Kep", kh: "កែប" },
  KOH_KONG: { en: "Koh Kong", kh: "កោះកុង" },
  KRATIE: { en: "Kratie", kh: "ក្រចេះ" },
  MONDUL_KIRI: { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  MONDULKIRI: { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  OTDAR_MEANCHEY: { en: "Otdar Meanchey", kh: "ឧត្តរមានជ័យ" },
  ODDAR_MEANCHEY: { en: "Otdar Meanchey", kh: "ឧត្តរមានជ័យ" },
  PAILIN: { en: "Pailin", kh: "ប៉ៃលិន" },
  PHNOM_PENH: { en: "Phnom Penh", kh: "រាជធានីភ្នំពេញ" },
  SIHANOUKVILLE: { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  PREAH_SIHANOUK: { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  PREAH_VIHEAR: { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  PREY_VENG: { en: "Prey Veng", kh: "ព្រៃវែង" },
  PURSAT: { en: "Pursat", kh: "ពោធិ៍សាត់" },
  RATANAK_KIRI: { en: "Ratanak Kiri", kh: "រតនគិរី" },
  RATANAKIRI: { en: "Ratanak Kiri", kh: "រតនគិរី" },
  SIEMREAP: { en: "Siemreap", kh: "សៀមរាប" },
  SIEM_REAP: { en: "Siemreap", kh: "សៀមរាប" },
  STUNG_TRENG: { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  SVAY_RIENG: { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  TAKEO: { en: "Takeo", kh: "តាកែវ" },
  TBOUNG_KHMUM: { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
} as const;

function normalizeOptionKey(text: string) {
  return text.trim().toUpperCase().replaceAll(/\s+/g, "_");
}

export function CustomFilterSelect({
  label,
  options,
  selected,
  onChange,
  isHeader = false,
  disabled = false,
  placeholder = "Select an option",
  labelClassName = "",
}: {
  label: string;
  options: FilterOption[];
  selected: string;
  onChange: (val: string) => void;
  isHeader?: boolean;
  disabled?: boolean;
  placeholder?: string;
  labelClassName?: string;
}) {
  const { language } = useI18n();
  const fontClass =
    language === "kh"
      ? "!font-khmer [&_*]:!font-khmer [&_.sub-title]:!font-khmer"
      : "!font-thicccboi [&_*]:!font-thicccboi [&_.sub-title]:!font-thicccboi";
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useMemo(() => [menuRef], []);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const closeDropdown = useCallback(() => setIsOpen(false), []);

  const tLocal = useCallback(
    (text: string) => {
      const lang = language === "kh" ? "kh" : "en";

      if (text in DROPDOWN_TEXT) {
        return DROPDOWN_TEXT[text as keyof typeof DROPDOWN_TEXT][lang];
      }

      const optionKey = normalizeOptionKey(text);

      if (optionKey in OPTION_TEXT) {
        return OPTION_TEXT[optionKey as keyof typeof OPTION_TEXT][lang];
      }

      return text;
    },
    [language],
  );

  const normalizedOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === "string"
          ? { value: option, label: tLocal(option) }
          : { ...option, label: tLocal(option.label) },
      ),
    [options, tLocal],
  );

  const selectedLabel = useMemo(() => {
    const foundOption = normalizedOptions.find(
      (option) => option.value === selected,
    );

    return foundOption?.label ?? tLocal(selected);
  }, [normalizedOptions, selected, tLocal]);

  useDismissibleDropdown({
    open: isOpen,
    containerRef,
    additionalRefs: dropdownRefs,
    onClose: closeDropdown,
  });

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setMenuStyle({
      top: rect.bottom + 6,
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

  const renderMenu = (className: string, optionClassName: string) =>
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuStyle.top,
              left: menuStyle.left,
              width: menuStyle.width,
            }}
            className={className}
          >
            <div
              className={`max-h-60 overflow-y-auto [scrollbar-width:thin] ${fontClass}`}
              onWheel={(e) => e.stopPropagation()}
            >
              {normalizedOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`${optionClassName} ${
                    selected === option.value
                      ? "bg-primary/10 text-primary"
                      : "text-secondary-body hover:bg-light-grey/50 hover:text-dark-grey"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )
      : null;

  if (isHeader) {
    return (
      <div
        ref={containerRef}
        className={`relative isolate flex w-full flex-col gap-1.5 ${
          isOpen ? "z-100" : "z-10"
        } ${fontClass}`}
      >
        <button
          ref={triggerRef}
          type="button"
          onClick={toggleDropdown}
          className="group flex items-center justify-between gap-1 w-full text-left font-bold text-primary transition-colors hover:text-dark-grey text-[14px] uppercase tracking-wider"
        >
          <span className="truncate">
            {selected === "All" ? label : selectedLabel}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary" : "text-muted"
            }`}
          />
        </button>

        {renderMenu(
          "z-[10000] min-w-42.5 max-w-xs rounded-[12px] border border-light-grey bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 normal-case tracking-normal font-medium text-dark-grey",
          "flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium normal-case transition-colors",
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`flex flex-col gap-1.5 w-full relative ${fontClass}`}>
      <label
        className={`text-[14px] font-medium uppercase tracking-wider sub-title ${
          labelClassName || (label === "Status" ? "text-muted" : "text-gray-500")
        }`}
      >
        {label}
      </label>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition-all ${
          isOpen
            ? "border-primary shadow-[0_0_0_2px_rgba(34,197,94,0.08)]"
            : "border-light-grey hover:border-primary/40"
        }`}
        style={{ height: "46px" }}
      >
        <span
          className={`text-[14px] font-medium truncate ${
            disabled ? "text-muted" : "text-dark-grey"
          }`}
        >
          {selected ? selectedLabel : tLocal(placeholder)}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted"
          }`}
        />
      </button>

      {!disabled &&
        renderMenu(
          "z-[9999] rounded-xl border border-light-grey bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150",
          "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left",
        )}
    </div>
  );
}
