"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import {
  DayPicker,
  type ClassNames,
  DateRange,
  useDayPicker,
} from "react-day-picker";

import "react-day-picker/dist/style.css";
import { useMarketPriceText } from "../../app/(main)/market-price/_components/marketPriceText";

interface DateRangePickerProps {
  label?: string;

  startDate?: string;
  endDate?: string;

  onChange: (start: string, end: string) => void;
}

export default function DateRangePicker({
  label,
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  const { t, fontClass } = useMarketPriceText();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  const [range, setRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });

  const closeDropdown = useCallback(() => setOpen(false), []);

  const handleSelect = (selected: DateRange | undefined) => {
    setRange(selected);

    if (
      selected?.from &&
      selected?.to &&
      selected.from.getTime() !== selected.to.getTime()
    ) {
      onChange(
        format(selected.from, "yyyy-MM-dd"),
        format(selected.to, "yyyy-MM-dd"),
      );

      setOpen(false);
    }
  };

  useEffect(() => {
    setRange({
      from: startDate ? new Date(startDate) : undefined,
      to: endDate ? new Date(endDate) : undefined,
    });
  }, [startDate, endDate]);

  return (
    <div ref={wrapperRef} className={`relative flex flex-col ${fontClass}`}>
      {/* Label */}
      <label className="text-[15px] font-medium uppercase tracking-widest text-muted">
        {label ?? t("market.date.label")}
      </label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between rounded-[12px] border bg-white px-4 text-left transition-all ${
          open
            ? "border-primary shadow-[0_0_0_2px_rgba(34,197,94,0.08)]"
            : "border-light-grey"
        }`}
        style={{ height: "46px" }}
      >
        <span className="truncate text-[16px] font-medium text-muted">
          {range?.from || range?.to
            ? `${range?.from ? format(range.from, "dd/MM/yyyy") : t("market.date.start")} - ${
                range?.to ? format(range.to, "dd/MM/yyyy") : t("market.date.end")
              }`
            : t("market.date.selectRange")}
        </span>

        <svg
          width="18"
          height="18"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-muted"
        >
          <path
            d="M13.9592 2.96602V1.66602C13.9592 1.32435 13.6758 1.04102 13.3342 1.04102C12.9925 1.04102 12.7092 1.32435 12.7092 1.66602V2.91602H7.29251V1.66602C7.29251 1.32435 7.00918 1.04102 6.66751 1.04102C6.32584 1.04102 6.04251 1.32435 6.04251 1.66602V2.96602C3.79251 3.17435 2.70084 4.51602 2.53418 6.50768C2.51751 6.74935 2.71751 6.94935 2.95084 6.94935H17.0508C17.2925 6.94935 17.4925 6.74102 17.4675 6.50768C17.3008 4.51602 16.2092 3.17435 13.9592 2.96602Z"
            fill="currentColor"
          />
          <path
            d="M16.6667 8.19922H3.33333C2.875 8.19922 2.5 8.57422 2.5 9.03255V14.1659C2.5 16.6659 3.75 18.3326 6.66667 18.3326H13.3333C16.25 18.3326 17.5 16.6659 17.5 14.1659V9.03255C17.5 8.57422 17.125 8.19922 16.6667 8.19922ZM7.675 15.1742C7.59167 15.2492 7.5 15.3076 7.4 15.3492C7.3 15.3909 7.19167 15.4159 7.08333 15.4159C6.975 15.4159 6.86667 15.3909 6.76667 15.3492C6.66667 15.3076 6.575 15.2492 6.49167 15.1742C6.34167 15.0159 6.25 14.7992 6.25 14.5826C6.25 14.3659 6.34167 14.1492 6.49167 13.9909C6.575 13.9159 6.66667 13.8576 6.76667 13.8159C6.96667 13.7326 7.2 13.7326 7.4 13.8159C7.5 13.8576 7.59167 13.9159 7.675 13.9909C7.825 14.1492 7.91667 14.3659 7.91667 14.5826C7.91667 14.7992 7.825 15.0159 7.675 15.1742ZM7.85 11.9826C7.80833 12.0826 7.75 12.1742 7.675 12.2576C7.59167 12.3326 7.5 12.3909 7.4 12.4326C7.3 12.4742 7.19167 12.4992 7.08333 12.4992C6.975 12.4992 6.86667 12.4742 6.76667 12.4326C6.66667 12.3909 6.575 12.3326 6.49167 12.2576C6.41667 12.1742 6.35833 12.0826 6.31667 11.9826C6.275 11.8826 6.25 11.7742 6.25 11.6659C6.25 11.5576 6.275 11.4492 6.31667 11.3492C6.35833 11.2492 6.41667 11.1576 6.49167 11.0742C6.575 10.9992 6.66667 10.9409 6.76667 10.8992C6.96667 10.8159 7.2 10.8159 7.4 10.8992C7.5 10.9409 7.59167 10.9992 7.675 11.0742C7.75 11.1576 7.80833 11.2492 7.85 11.3492C7.89167 11.4492 7.91667 11.5576 7.91667 11.6659C7.91667 11.7742 7.89167 11.8826 7.85 11.9826ZM10.5917 12.2576C10.5083 12.3326 10.4167 12.3909 10.3167 12.4326C10.2167 12.4742 10.1083 12.4992 10 12.4992C9.89167 12.4992 9.78333 12.4742 9.68333 12.4326C9.58333 12.3909 9.49167 12.3326 9.40833 12.2576C9.25833 12.0992 9.16667 11.8826 9.16667 11.6659C9.16667 11.4492 9.25833 11.2326 9.40833 11.0742C9.49167 10.9992 9.58333 10.9409 9.68333 10.8992C9.88333 10.8076 10.1167 10.8076 10.3167 10.8992C10.4167 10.9409 10.5083 10.9992 10.5917 11.0742C10.7417 11.2326 10.8333 11.4492 10.8333 11.6659C10.8333 11.8826 10.7417 12.0992 10.5917 12.2576Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Calendar popup */}
      {open && (
        <div
          className="
            absolute right-0 top-[68px]
            z-[9999]
            mt-2
            w-fit
            min-w-fit
            rounded-[16px]
            border border-border
            bg-white
            p-3
            shadow-[0_16px_40px_rgba(15,23,42,0.14)]
          "
        >
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setRange({ from: today, to: today });
                onChange(
                  format(today, "yyyy-MM-dd"),
                  format(today, "yyyy-MM-dd"),
                );
                setOpen(false);
              }}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              {t("market.date.today")}
            </button>

            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const next7 = new Date();
                next7.setDate(today.getDate() + 7);
                setRange({ from: today, to: next7 });
                onChange(
                  format(today, "yyyy-MM-dd"),
                  format(next7, "yyyy-MM-dd"),
                );
                setOpen(false);
              }}
              className="rounded-lg border px-3 py-1 text-sm"
            >
              {t("market.date.next7Days")}
            </button>
          </div>

          <DayPicker
            mode="range"
            required={false}
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={2}
            components={{
              Nav: () => <></>,
              Chevron: ({ orientation }) => (
                <span
                  className="
                    absolute left-0
                    rounded-lg
                    p-1
                    text-[36px]
                    font-bold
                    leading-none
                    text-primary
                    transition-colors
                    hover:bg-[#EEF8F1]
                  "
                >
                  {orientation === "left" ? "‹" : "›"}
                </span>
              ),
              MonthCaption: ({ calendarMonth, displayIndex }) => {
                const { goToMonth, previousMonth, nextMonth } = useDayPicker();
                const isFirst = displayIndex === 0;
                const isLast = displayIndex === 1;

                return (
                  <div className="relative mb-6 flex items-center justify-center">
                    {isFirst && (
                      <button
                        type="button"
                        onClick={() =>
                          previousMonth && goToMonth(previousMonth)
                        }
                        className="absolute left-0 rounded-lg p-1 text-[22px] font-bold leading-none text-primary transition-colors hover:bg-[#EEF8F1]"
                      >
                        ‹
                      </button>
                    )}

                    <span className="text-[15px] font-semibold text-primary-heading">
                      {format(calendarMonth.date, "MMMM yyyy")}
                    </span>

                    {isLast && (
                      <button
                        type="button"
                        onClick={() => nextMonth && goToMonth(nextMonth)}
                        className="absolute right-0 rounded-lg p-1 text-[22px] font-bold leading-none text-primary transition-colors hover:bg-[#EEF8F1]"
                      >
                        ›
                      </button>
                    )}
                  </div>
                );
              },
            }}
            classNames={
              {
                months: "flex gap-8",
                month: "space-y-2",
                caption: "mb-0",
                nav: "hidden",
                caption_label: "text-[15px] font-semibold text-primary-heading",
                day_button:
                  "h-6.5 w-6.5 rounded-lg hover:bg-[#F1F5F9] transition-colors",
                head_row: "flex",
                head_cell: "w-7 text-muted font-medium text-[12px]",
                row: "flex w-full mt-1",
                cell: "h-7 w-7 text-center text-[13px] relative",
                day: "h-7 w-7 rounded-lg font-medium hover:bg-[#EEF8F1] transition-colors",
                day_today: "border border-primary text-primary",
              } as Partial<ClassNames>
            }
          />
        </div>
      )}
    </div>
  );
}