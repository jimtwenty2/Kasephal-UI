"use client";

import { useCallback, useRef, useState } from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { useDismissibleDropdown } from "@/hooks/useDismissibleDropdown";

import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  label?: string;

  startDate?: string;
  endDate?: string;

  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({
  label = "Date",
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [range, setRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  const closeDropdown = useCallback(() => setOpen(false), []);

  useDismissibleDropdown({
    open,
    containerRef: wrapperRef,
    onClose: closeDropdown,
  });

  const handleSelect = (selected: DateRange | undefined) => {
    setRange(selected);

    if (selected?.from && selected?.to) {
      onChange(
        format(selected.from, "yyyy-MM-dd"),
        format(selected.to, "yyyy-MM-dd")
      );

      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative flex flex-col gap-1">
      {/* Label */}
      <label className="text-[16px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="
          flex h-[42px] min-w-[250px] items-center justify-between
          rounded-[10px]
          border border-border
          bg-white
          px-4
          text-[14px]
          font-medium
          text-secondary-body
          transition-all duration-200
          hover:border-[#B8C4D0]
          hover:bg-[#F8FAFC]
          focus:outline-none
          focus:ring-2
          focus:ring-primary/10
        "
      >
        <span className="truncate">
          {range?.from
            ? format(range.from, "dd/MM/yyyy")
            : "Start Date"}{" "}
          -{" "}
          {range?.to
            ? format(range.to, "dd/MM/yyyy")
            : "End Date"}
        </span>

        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          className="
            absolute right-0 top-[72px] z-50
            rounded-2xl
            border border-border
            bg-white
            p-4
            shadow-[0_12px_40px_rgba(15,23,42,0.12)]
          "
        >
          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </div>
      )}
    </div>
  );
}
