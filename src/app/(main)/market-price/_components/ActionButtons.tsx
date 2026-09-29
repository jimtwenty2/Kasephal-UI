"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FileText, FileSpreadsheet, FileDown } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";
import { useMarketPriceText } from "./marketPriceText";

export type ExportType = "csv" | "excel" | "pdf";

const EXPORT_OPTIONS: { key: ExportType; labelKey: string; descriptionKey: string; icon: React.ReactNode; iconBg: string }[] = [
  {
    key: "csv",
    labelKey: "market.export.csv",
    descriptionKey: "market.export.csv.description",
    icon: <FileText className="h-4 w-4 text-primary" />,
    iconBg: "bg-primary/10",
  },
  {
    key: "excel",
    labelKey: "market.export.excel",
    descriptionKey: "market.export.excel.description",
    icon: <FileSpreadsheet className="h-4 w-4 text-primary" />,
    iconBg: "bg-primary/10",
  },
  {
    key: "pdf",
    labelKey: "market.export.pdf",
    descriptionKey: "market.export.pdf.description",
    icon: <FileDown className="h-4 w-4 text-red-500" />,
    iconBg: "bg-red-50",
  },
];

interface ActionButtonsProps {
  onRefresh: () => void;
  onExport?: (type: ExportType) => void;
}

export default function ActionButtons({
  onRefresh,
  onExport,
}: ActionButtonsProps) {
  const { t, fontClass } = useMarketPriceText();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const dropdownRefs = useMemo(() => [menuRef], []);

  useDismissibleDropdown({ open: isOpen, containerRef, additionalRefs: dropdownRefs, onClose: closeDropdown });

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + window.scrollY + 8,
      left: rect.right + window.scrollX - 220,
    });
  }, []);

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

  const toggleDropdown = () => {
    if (!isOpen) updateMenuPosition();
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className={`flex items-end gap-2 ${fontClass}`}>
      <button
        onClick={onRefresh}
        title={t("market.action.refresh")}
        className="flex items-center justify-center w-[46px] h-[46px] bg-transparent border border-border rounded-lg text-secondary-body hover:text-primary hover:border-primary transition-all duration-200 active:scale-95"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 10C2.5 8.01088 3.29018 6.10322 4.6967 4.6967C6.10322 3.29018 8.01088 2.5 10 2.5C12.0967 2.50789 14.1092 3.32602 15.6167 4.78333L17.5 6.66667"
            stroke="#404040"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5007 2.5V6.66667H13.334"
            stroke="#404040"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M17.5 10C17.5 11.9891 16.7098 13.8968 15.3033 15.3033C13.8968 16.7098 11.9891 17.5 10 17.5C7.90329 17.4921 5.89081 16.674 4.38333 15.2167L2.5 13.3333"
            stroke="#404040"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.66667 13.334H2.5V17.5007"
            stroke="#404040"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        ref={triggerRef}
        onClick={toggleDropdown}
        title={t("market.action.export")}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center justify-center w-[46px] h-[46px] bg-transparent border border-primary rounded-lg text-primary hover:bg-primary/10 transition-all duration-200 active:scale-95"
      >
        <svg
          className="ml-1 h-6 w-6 shrink-0"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.50065 14.166V9.16602L5.83398 10.8327"
            stroke="#107446"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 9.16602L9.16667 10.8327"
            stroke="#107446"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.3327 8.33268V12.4993C18.3327 16.666 16.666 18.3327 12.4993 18.3327H7.49935C3.33268 18.3327 1.66602 16.666 1.66602 12.4993V7.49935C1.66602 3.33268 3.33268 1.66602 7.49935 1.66602H11.666"
            stroke="#107446"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.3327 8.33268H14.9993C12.4993 8.33268 11.666 7.49935 11.666 4.99935V1.66602L18.3327 8.33268Z"
            stroke="#107446"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "absolute",
                top: menuStyle.top,
                left: menuStyle.left,
                width: 220,
              }}
              className="z-[10000] rounded-xl border border-light-grey bg-white p-1.5 shadow-xl"
            >
              {EXPORT_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onExport?.(option.key);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-light-grey/50"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${option.iconBg}`}>
                    {option.icon}
                  </span>
                  <div>
                    <span className="block text-[14px] font-semibold text-primary-heading">{t(option.labelKey)}</span>
                    <span className="block text-[12px] font-medium text-muted">{t(option.descriptionKey)}</span>
                  </div>
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
