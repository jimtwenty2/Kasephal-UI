"use client";

import React, { useMemo } from "react";
import { CalendarDate, parseDate } from "@internationalized/date";
import { Calendar, DateField, DatePicker, Label } from "@heroui/react";

type DatePickerComponentProps = {
  id: string;
  name?: string;
  value: string;
  label?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  disabled?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  className?: string;
  groupClassName?: string;
  popoverClassName?: string;
  popoverOffset?: number;
  calendarSize?: "default" | "lg";
  calendarLabel?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
};

function toDateInputValue(date?: Date | string) {
  if (!date) return new Date().toISOString().split("T")[0];

  if (typeof date === "string") {
    return date.includes("T") ? date.split("T")[0] : date;
  }

  return date.toISOString().split("T")[0];
}

function safeParseDate(date?: Date | string): CalendarDate {
  try {
    return parseDate(toDateInputValue(date));
  } catch {
    return parseDate(toDateInputValue(new Date()));
  }
}

function getMonthYearText(monthYear: string) {
  const yearMatch = monthYear.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : "";
  const month = monthYear
    .replace(year, "")
    .replace(/[,.\s]+/g, " ")
    .trim()
    .slice(0, 3);

  return `${month} ${year}`.trim();
}

function formatSelectedDate(date: CalendarDate | null) {
  if (!date) return "";

  const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(
    new Date(date.year, date.month - 1, date.day),
  );

  return `${String(date.day).padStart(2, "0")} ${month}, ${date.year}`;
}

export function DatePickerComponent({
  id,
  name,
  value,
  label = "Select date",
  minDate,
  maxDate,
  disabled = false,
  invalid = false,
  clearable = true,
  className = "",
  groupClassName = "",
  popoverClassName = "",
  popoverOffset = 12,
  calendarSize = "default",
  calendarLabel,
  onBlur,
  onChange,
}: DatePickerComponentProps) {
  const isLargeCalendar = calendarSize === "lg";
  const dateValue = useMemo(() => {
    try {
      return value ? parseDate(toDateInputValue(value)) : null;
    } catch {
      return null;
    }
  }, [value]);

  const minValue = useMemo(() => safeParseDate(minDate), [minDate]);

  const maxValue = useMemo(() => {
    if (!maxDate) return undefined;
    return safeParseDate(maxDate);
  }, [maxDate]);
  const selectedDisplayValue = useMemo(
    () => formatSelectedDate(dateValue),
    [dateValue],
  );

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <DatePicker
      name={name ?? id}
      value={dateValue}
      minValue={minValue}
      maxValue={maxValue}
      isDisabled={disabled}
      isInvalid={invalid}
      onBlur={onBlur}
      onChange={(date) => onChange(date?.toString() ?? "")}
      className={`w-full ${className}`}
    >
      <Label className="sr-only">{label}</Label>

      <DateField.Group
        className={`relative h-12 rounded-xl border bg-white shadow-xs transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 ${
          invalid
            ? "border-red-500 hover:border-red-500"
            : "border-light-grey hover:border-primary/40"
        } ${
          disabled ? "cursor-not-allowed bg-slate-50 opacity-60" : ""
        } ${groupClassName}`}
      >
        {selectedDisplayValue && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-slate-800">
            {selectedDisplayValue}
          </span>
        )}

        <DateField.Input
          className={`min-w-0 flex-1 text-[15px] font-medium text-slate-800 ${
            selectedDisplayValue ? "text-transparent" : ""
          }`}
        >
          {(segment) => (
            <DateField.Segment
              segment={segment}
              className={`rounded px-0.5 outline-none transition-colors data-focused:bg-emerald-50 data-focused:text-emerald-600 data-placeholder:text-gray-400 ${
                selectedDisplayValue
                  ? "text-transparent data-focused:text-transparent"
                  : ""
              }`}
            />
          )}
        </DateField.Input>

        <DateField.Suffix className="flex items-center gap-1.5">
          {clearable && value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear date selection"
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          <DatePicker.Trigger className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20">
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>

      <DatePicker.Popover
        placement="bottom end"
        offset={popoverOffset}
        className={`z-100 rounded-[24px] border border-slate-100 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] focus:outline-none ${
         isLargeCalendar
            ? "w-105! min-w-105 max-w-[calc(100vw-2rem)] p-5"
            : "w-83 p-4"
        } ${popoverClassName}`}
      >
        <Calendar
          aria-label={calendarLabel ?? label}
          minValue={minValue}
          maxValue={maxValue}
        >
          <Calendar.Header
            className={`flex items-center justify-between ${
              isLargeCalendar ? "mb-3" : "mb-2"
            }`}
          >
            <Calendar.YearPickerTrigger
              className={`flex w-fit items-center rounded-xl bg-emerald-50 text-left transition-colors hover:bg-emerald-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 ${
                isLargeCalendar
                  ? "max-w-50 gap-12 px-4 py-2"
                  : "max-w-36 gap-8 px-2.5 py-1.5"
              }`}
            >
              {({ monthYear }) => (
                <>
                  <span className="min-w-0 truncate text-[16px] font-semibold text-slate-900">
                    {getMonthYearText(monthYear)}
                  </span>

                  <span className="flex rounded-full bg-white/70 p-0.5 text-emerald-600">
                    <Calendar.YearPickerTriggerIndicator />
                  </span>
                </>
              )}
            </Calendar.YearPickerTrigger>

            <div className={`flex items-center ${isLargeCalendar ? "gap-2" : "gap-1"}`}>
              <Calendar.NavButton
                slot="previous"
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
              />

              <Calendar.NavButton
                slot="next"
                className="flex h-8 w-8 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
              />
            </div>
          </Calendar.Header>

          <Calendar.Grid
            className={`w-full border-separate ${
              isLargeCalendar
                ? "min-w-90 border-spacing-x-2 border-spacing-y-1"
                : "border-spacing-y-1"
            }`}
          >
            <Calendar.GridHeader>
              {(day) => (
                <Calendar.HeaderCell
                  className="h-8 text-center text-[12px] font-semibold text-slate-400"
                >
                  {day.slice(0, 2)}
                </Calendar.HeaderCell>
              )}
            </Calendar.GridHeader>

            <Calendar.GridBody>
              {(date) => (
                <Calendar.Cell
                  date={date}
                  className="h-9 w-9 rounded-full text-[14px] font-semibold text-slate-900 transition-all duration-150 hover:bg-emerald-50 hover:text-emerald-600 data-disabled:cursor-not-allowed data-disabled:text-slate-200 data-outside-month:text-slate-300 data-selected:bg-emerald-600 data-selected:text-white data-today:text-emerald-600 data-selected:data-today:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
                />
              )}
            </Calendar.GridBody>
          </Calendar.Grid>

          <Calendar.YearPickerGrid
            className={`top-11! mt-0 overflow-y-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_10px_26px_rgba(15,23,42,0.08)] [scrollbar-color:#059669_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500/45 [&::-webkit-scrollbar-thumb:hover]:bg-emerald-600/70 ${
              isLargeCalendar ? "h-58! min-w-[320px]" : "h-58!"
            }`}
          >
            <Calendar.YearPickerGridBody>
              {({ year }) => (
                <Calendar.YearPickerCell
                  year={year}
                  className="rounded-xl px-3 py-2 text-center text-[14px] font-semibold text-slate-900 transition-colors hover:bg-emerald-50 hover:text-emerald-600 data-selected:bg-emerald-600 data-selected:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20"
                />
              )}
            </Calendar.YearPickerGridBody>
          </Calendar.YearPickerGrid>
        </Calendar>
      </DatePicker.Popover>
    </DatePicker>
  );
}

export default DatePickerComponent;
