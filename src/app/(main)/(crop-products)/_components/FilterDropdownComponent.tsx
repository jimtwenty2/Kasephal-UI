"use client";

import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useI18n } from "@/lib/i18n/I18nContext";

const FILTER_DROPDOWN_TEXT = {
  "filterDropdown.all": { en: "All", kh: "ទាំងអស់" },
  "filterDropdown.cropType": { en: "Crop Type", kh: "ប្រភេទដំណាំ" },
  "filterDropdown.region": { en: "Region", kh: "តំបន់" },
  "filterDropdown.status": { en: "Status", kh: "ស្ថានភាព" },
  "filterDropdown.status.AVAILABLE": { en: "Available", kh: "មានស្តុក" },
  "filterDropdown.status.UNAVAILABLE": { en: "Unavailable", kh: "មិនមានស្តុក" },
  "filterDropdown.status.OPEN": { en: "Open", kh: "បើក" },
  "filterDropdown.status.MATCHED": { en: "Matched", kh: "បានផ្គូផ្គង" },
  "filterDropdown.status.CLOSED": { en: "Closed", kh: "បានបិទ" },
  "filterDropdown.status.APPLY": { en: "Apply", kh: "ដាក់ពាក្យ" },
  "filterDropdown.cropType.Rice_Crops": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "filterDropdown.cropType.RICE_CROPS": { en: "Rice Crops", kh: "ដំណាំស្រូវ" },
  "filterDropdown.cropType.Fruit": { en: "Fruit", kh: "ផ្លែឈើ" },
  "filterDropdown.cropType.Fruits": { en: "Fruits", kh: "ផ្លែឈើ" },
  "filterDropdown.cropType.FRUIT_CROPS": { en: "Fruit Crops", kh: "ដំណាំផ្លែឈើ" },
  "filterDropdown.cropType.Vegetable": { en: "Vegetable", kh: "បន្លែ" },
  "filterDropdown.cropType.Vegetables": { en: "Vegetables", kh: "បន្លែ" },
  "filterDropdown.cropType.VEGETABLES": { en: "Vegetables", kh: "បន្លែ" },
  "filterDropdown.cropType.Legumes": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "filterDropdown.cropType.LEGUMES": { en: "Legumes", kh: "ដំណាំសណ្តែក" },
  "filterDropdown.cropType.Herbs": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "filterDropdown.cropType.HERBS": { en: "Herbs", kh: "រុក្ខជាតិឱសថ" },
  "filterDropdown.cropType.Spices": { en: "Spices", kh: "គ្រឿងទេស" },
  "filterDropdown.cropType.SPICES": { en: "Spices", kh: "គ្រឿងទេស" },
  "filterDropdown.cropType.Nuts": { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  "filterDropdown.cropType.NUTS": { en: "Nuts", kh: "គ្រាប់ធញ្ញជាតិ" },
  "filterDropdown.cropType.Grain": { en: "Grain", kh: "គ្រាប់ធញ្ញជាតិ" },
  "filterDropdown.cropType.GRAIN": { en: "Grain", kh: "គ្រាប់ធញ្ញជាតិ" },
  "filterDropdown.cropType.Grains": { en: "Grains", kh: "គ្រាប់ធញ្ញជាតិ" },
  "filterDropdown.cropType.GRAINS": { en: "Grains", kh: "គ្រាប់ធញ្ញជាតិ" },
  "filterDropdown.cropType.Fiber_Crop": { en: "Fiber Crop", kh: "ដំណាំសរសៃ" },
  "filterDropdown.cropType.FIBER_CROP": { en: "Fiber Crop", kh: "ដំណាំសរសៃ" },
  "filterDropdown.cropType.Fiber_Crops": { en: "Fiber Crops", kh: "ដំណាំសរសៃ" },
  "filterDropdown.cropType.FIBER_CROPS": { en: "Fiber Crops", kh: "ដំណាំសរសៃ" },
  "filterDropdown.cropType.Root_Crops": { en: "Root Crops", kh: "ដំណាំមើម" },
  "filterDropdown.cropType.ROOT_CROPS": { en: "Root Crops", kh: "ដំណាំមើម" },
  "filterDropdown.cropType.Industrial_Crops": {
    en: "Industrial Crops",
    kh: "ដំណាំឧស្សាហកម្ម",
  },
  "filterDropdown.cropType.INDUSTRIAL_CROPS": {
    en: "Industrial Crops",
    kh: "ដំណាំឧស្សាហកម្ម",
  },
  "filterDropdown.location.Cambodia": { en: "Cambodia", kh: "កម្ពុជា" },
  "filterDropdown.location.BANTEAY_MEANCHEY": {
    en: "Banteay Meanchey",
    kh: "បន្ទាយមានជ័យ",
  },
  "filterDropdown.location.BATTAMBANG": { en: "Battambang", kh: "បាត់ដំបង" },
  "filterDropdown.location.KAMPONG_CHAM": { en: "Kampong Cham", kh: "កំពង់ចាម" },
  "filterDropdown.location.KAMPONG_CHHNANG": {
    en: "Kampong Chhnang",
    kh: "កំពង់ឆ្នាំង",
  },
  "filterDropdown.location.KAMPONG_SPEU": { en: "Kampong Speu", kh: "កំពង់ស្ពឺ" },
  "filterDropdown.location.KAMPONG_THOM": { en: "Kampong Thom", kh: "កំពង់ធំ" },
  "filterDropdown.location.KAMPOT": { en: "Kampot", kh: "កំពត" },
  "filterDropdown.location.KANDAL": { en: "Kandal", kh: "កណ្តាល" },
  "filterDropdown.location.KEP": { en: "Kep", kh: "កែប" },
  "filterDropdown.location.KOH_KONG": { en: "Koh Kong", kh: "កោះកុង" },
  "filterDropdown.location.KRATIE": { en: "Kratie", kh: "ក្រចេះ" },
  "filterDropdown.location.MONDUL_KIRI": { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  "filterDropdown.location.MONDULKIRI": { en: "Mondul Kiri", kh: "មណ្ឌលគិរី" },
  "filterDropdown.location.OTDAR_MEANCHEY": {
    en: "Otdar Meanchey",
    kh: "ឧត្តរមានជ័យ",
  },
  "filterDropdown.location.ODDAR_MEANCHEY": {
    en: "Otdar Meanchey",
    kh: "ឧត្តរមានជ័យ",
  },
  "filterDropdown.location.PAILIN": { en: "Pailin", kh: "ប៉ៃលិន" },
  "filterDropdown.location.PHNOM_PENH": {
    en: "Phnom Penh",
    kh: "រាជធានីភ្នំពេញ",
  },
  "filterDropdown.location.SIHANOUKVILLE": { en: "Sihanoukville", kh: "ព្រះសីហនុ" },
  "filterDropdown.location.PREAH_SIHANOUK": {
    en: "Sihanoukville",
    kh: "ព្រះសីហនុ",
  },
  "filterDropdown.location.PREAH_VIHEAR": { en: "Preah Vihear", kh: "ព្រះវិហារ" },
  "filterDropdown.location.PREY_VENG": { en: "Prey Veng", kh: "ព្រៃវែង" },
  "filterDropdown.location.PURSAT": { en: "Pursat", kh: "ពោធិ៍សាត់" },
  "filterDropdown.location.RATANAK_KIRI": { en: "Ratanak Kiri", kh: "រតនគិរី" },
  "filterDropdown.location.RATANAKIRI": { en: "Ratanak Kiri", kh: "រតនគិរី" },
  "filterDropdown.location.SIEMREAP": { en: "Siemreap", kh: "សៀមរាប" },
  "filterDropdown.location.SIEM_REAP": { en: "Siemreap", kh: "សៀមរាប" },
  "filterDropdown.location.STUNG_TRENG": { en: "Stung Treng", kh: "ស្ទឹងត្រែង" },
  "filterDropdown.location.SVAY_RIENG": { en: "Svay Rieng", kh: "ស្វាយរៀង" },
  "filterDropdown.location.TAKEO": { en: "Takeo", kh: "តាកែវ" },
  "filterDropdown.location.TBOUNG_KHMUM": { en: "Tboung Khmum", kh: "ត្បូងឃ្មុំ" },
} as const;

function getFilterDropdownText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    FILTER_DROPDOWN_TEXT[key as keyof typeof FILTER_DROPDOWN_TEXT]?.[lang] ??
    key;
}

function normalizeOptionKey(value: string) {
  return value.trim().replaceAll(" ", "_");
}

function getOptionKeyCandidates(value: string) {
  const normalizedValue = value.trim().replaceAll("_", " ").replaceAll(/\s+/g, " ");
  const titleKey = normalizedValue
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("_");
  const upperKey = normalizedValue.toUpperCase().replaceAll(" ", "_");

  return Array.from(
    new Set([value.trim(), normalizeOptionKey(value), titleKey, upperKey]),
  );
}

function normalizeLocationKey(value: string) {
  return value.trim().toUpperCase().replaceAll(" ", "_");
}

function translateOption(value: string, label: string, t: (key: string) => string) {
  if (value === "All") return t("filterDropdown.all");

  const normalizedStatus = value.toUpperCase();
  const statusText = t(`filterDropdown.status.${normalizedStatus}`);

  if (statusText !== `filterDropdown.status.${normalizedStatus}`) {
    return statusText;
  }

  for (const candidate of getOptionKeyCandidates(value)) {
    const cropTypeKey = `filterDropdown.cropType.${candidate}`;
    const cropTypeText = t(cropTypeKey);

    if (cropTypeText !== cropTypeKey) return cropTypeText;
  }

  const locationKey = `filterDropdown.location.${normalizeLocationKey(value)}`;
  const locationText = t(locationKey);

  if (locationText !== locationKey) return locationText;

  return label === "Status" ? value.replaceAll("_", " ") : value;
}

function translateLabel(label: string, t: (key: string) => string) {
  const labelKeyMap: Record<string, string> = {
    "Crop Type": "filterDropdown.cropType",
    Region: "filterDropdown.region",
    Status: "filterDropdown.status",
  };
  const key = labelKeyMap[label];

  return key ? t(key) : label;
}

// ==========================================================
// UPGRADED HEADER SELECT (MATCHES CUSTOMFILTERSELECT DESIGN)
// ==========================================================
interface HeaderSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | number)[];
  setCurrentPage: (page: number) => void;
}

export function HeaderSelect({
  label,
  value,
  onChange,
  options,
  setCurrentPage,
}: HeaderSelectProps) {
  const { language } = useI18n();
  const t = getFilterDropdownText(language);
  const fontClass =
    language === "kh"
      ? "!font-khmer [&_*]:!font-khmer"
      : "!font-thicccboi [&_*]:!font-thicccboi";
  const translatedLabel = translateLabel(label, t);
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
    <div
      ref={containerRef}
      className={`relative isolate inline-block w-full text-left ${fontClass}`}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        className="group flex items-center justify-between gap-1 w-full text-left font-bold text-muted transition-colors hover:text-dark-grey text-[14px] uppercase tracking-wider"
      >
        <span className="truncate">
          {value === "All" ? translatedLabel : translateOption(value, label, t)}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted group-hover:text-dark-grey"
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
              className={`z-10000 min-w-42.5 max-w-xs rounded-3xl border border-light-grey bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 normal-case tracking-normal font-medium text-dark-grey ${fontClass}`}
            >
              <div className="max-h-60 overflow-y-auto [scrollbar-width:thin]">
                {options.map((option) => {
                  const optionStr = option.toString();
                  const optionLabel =
                    optionStr === "All"
                      ? `${t("filterDropdown.all")} ${translatedLabel}`
                      : translateOption(optionStr, label, t);

                  return (
                    <button
                      key={optionStr}
                      type="button"
                      onClick={() => {
                        onChange(optionStr);
                        setCurrentPage(1);
                        setIsOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-4 py-2.5 text-left text-sm font-medium normal-case transition-colors ${
                        value === optionStr
                          ? "bg-primary/10 text-primary"
                          : "text-secondary-body hover:bg-light-grey/50 hover:text-dark-grey"
                      }`}
                    >
                      {optionLabel}
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

// ==========================================================
// STYLED STATUS BADGE
// ==========================================================
interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { language } = useI18n();
  const t = getFilterDropdownText(language);
  const fontClass =
    language === "kh"
      ? "!font-khmer [&_*]:!font-khmer"
      : "!font-thicccboi [&_*]:!font-thicccboi";
  const normalizedStatus = status?.toUpperCase() || "";

  // Dynamic theme matching for Crop Demands and Crop Products using standard token properties
  const badgeStyles: Record<string, string> = {
    // Crop Product Status Types
    AVAILABLE: "bg-[#D1FAE5CC] text-green-800 border-green-200/40",
    UNAVAILABLE: "bg-[#FEE2E2CC] text-[#991B1B] border-red-200/40",
    // Crop Demand Status Types
    OPEN: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    MATCHED: "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]/60",
    CLOSED: "bg-rose-50 text-rose-700 border-rose-200/60",
  };

  const currentStyle = badgeStyles[normalizedStatus] || badgeStyles.AVAILABLE;

  return (
    <span
      className={`mb-1 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors dynamic-badge ${currentStyle} ${fontClass}`}
    >
      <span>{translateOption(status, "Status", t)}</span>
    </span>
  );
}
