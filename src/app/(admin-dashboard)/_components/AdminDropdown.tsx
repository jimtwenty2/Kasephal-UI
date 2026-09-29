"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";

export type AdminDropdownOption<T extends string = string> = {
  value: T;
  label: string;
};

type AdminDropdownProps<T extends string = string> = {
  value: T;
  options: AdminDropdownOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  menuListClassName?: string;
};

export default function AdminDropdown<T extends string = string>({
  value,
  options,
  onChange,
  label,
  placeholder = "Select",
  disabled = false,
  className = "w-full",
  triggerClassName = "",
  menuClassName = "",
  menuListClassName = "max-h-40",
}: AdminDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeDropdown = useCallback(() => setIsOpen(false), []);
  const dropdownRefs = useMemo(() => [menuRef], []);
  const selectedOption = options.find((option) => option.value === value);

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
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  const toggleDropdown = () => {
    if (disabled) return;

    if (!isOpen) {
      updateMenuPosition();
    }

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

  const menu =
    isOpen && typeof document !== "undefined" ? (
      <div
        ref={menuRef}
        role="listbox"
        style={{
          position: "fixed",
          top: menuStyle.top,
          left: menuStyle.left,
          width: menuStyle.width,
        }}
        className={`z-10000 origin-top rounded-3xl border border-light-grey bg-white p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150 ${menuClassName}`}
      >
        <div className={`${menuListClassName} overflow-y-auto [scrollbar-width:thin]`}>
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  selected
                    ? "bg-primary/10 text-primary"
                    : "text-secondary-body hover:bg-light-grey/50 hover:text-dark-grey"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="mb-1.5 block text-[13px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-light-grey bg-white px-4 text-left shadow-xs transition-all duration-200 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70 ${triggerClassName}`}
      >
        <span className="truncate text-[14px] font-medium text-dark-grey">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : "text-muted"
          }`}
        />
      </button>

      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
