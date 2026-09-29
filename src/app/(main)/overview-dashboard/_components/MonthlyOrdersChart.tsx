"use client";

import { groupOrdersByMonth, type Order } from "@/services/order.service";
import { useI18n } from "@/lib/i18n/I18nContext";
import type { GovernmentMonthlyOrder } from "@/types/overview-dashboard";

type Props = {
  orders: Order[];
  monthlyOrders?: GovernmentMonthlyOrder[];
};

const MONTHS = [
  { key: "01", en: "Jan", kh: "មករា" },
  { key: "02", en: "Feb", kh: "កុម្ភៈ" },
  { key: "03", en: "Mar", kh: "មីនា" },
  { key: "04", en: "Apr", kh: "មេសា" },
  { key: "05", en: "May", kh: "ឧសភា" },
  { key: "06", en: "Jun", kh: "មិថុនា" },
  { key: "07", en: "Jul", kh: "កក្កដា" },
  { key: "08", en: "Aug", kh: "សីហា" },
  { key: "09", en: "Sep", kh: "កញ្ញា" },
  { key: "10", en: "Oct", kh: "តុលា" },
  { key: "11", en: "Nov", kh: "វិច្ឆិកា" },
  { key: "12", en: "Dec", kh: "ធ្នូ" },
];

const CHART_TEXT = {
  orders: { en: "Orders", kh: "ការបញ្ជាទិញ" },
  monthlyOrders: { en: "Monthly Orders", kh: "ការបញ្ជាទិញប្រចាំខែ" },
  total: { en: "Total", kh: "សរុប" },
  busiestPeriod: { en: "Busiest period:", kh: "រយៈពេលមមាញឹកបំផុត:" },
  with: { en: "with", kh: "ជាមួយ" },
  ordersLabel: { en: "orders.", kh: "ការបញ្ជាទិញ។" },
  noOrders: { en: "No orders found", kh: "រកមិនឃើញការបញ្ជាទិញ" },
  noOrdersDesc: {
    en: "Monthly order data will appear here after orders are created.",
    kh: "ទិន្នន័យការបញ្ជាទិញប្រចាំខែនឹងបង្ហាញនៅទីនេះបន្ទាប់ពីការបញ្ជាទិញត្រូវបានបង្កើត។",
  },
} as const;

export default function MonthlyOrdersChart({
  orders,
  monthlyOrders: weeklyOrders = [],
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof CHART_TEXT) => CHART_TEXT[key][lang];

  const usesWeeklyData = weeklyOrders.length > 0;
  const monthlyOrders = groupOrdersByMonth(orders);
  const dataMap = Object.fromEntries(
    monthlyOrders.map((item) => [item.month, item]),
  );

  const totalOrders = usesWeeklyData
    ? weeklyOrders.reduce((sum, item) => sum + item.orderCount, 0)
    : orders.length;
  const hasData = totalOrders > 0;
  const busiestWeek = weeklyOrders.reduce<GovernmentMonthlyOrder | null>(
    (best, item) => (!best || item.orderCount > best.orderCount ? item : best),
    null,
  );
  const busiestMonth = monthlyOrders.reduce(
    (best, item) => (item.count > best.count ? item : best),
    monthlyOrders[0],
  );
  const busiestLabel =
    busiestWeek?.label ??
    MONTHS.find((month) => month.key === busiestMonth?.month)?.[lang] ??
    "-";
  const busiestCount = busiestWeek?.orderCount ?? busiestMonth?.count ?? 0;
  const maxWeeklyCount = Math.max(
    ...weeklyOrders.map((item) => item.orderCount),
    1,
  );

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
            {t("orders")}
          </p>
          <h2 className="mt-1 text-[24px] font-bold text-primary-heading">
            {t("monthlyOrders")}
          </h2>
        </div>
        {hasData && (
          <div className="text-right">
            <p className="text-[12px] font-bold uppercase tracking-wide text-muted">
              {t("total")}
            </p>
            <p className="text-[22px] font-bold text-primary-heading">
              {totalOrders}
            </p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="mt-4 rounded-2xl bg-primary/5 px-4 py-3">
          <p className="text-[13px] font-semibold text-secondary-body">
            {t("busiestPeriod")} <span className="font-bold text-primary-heading">{busiestLabel}</span>{" "}
            {t("with")} <span className="font-bold text-primary-heading">{busiestCount}</span>{" "}
            {t("ordersLabel")}
          </p>
        </div>
      )}

      <div className="mt-6 flex h-[280px] items-end justify-between gap-2">
        {!hasData ? (
          <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl bg-primary/5 text-center">
            <p className="text-[16px] font-bold text-primary-heading">
              {t("noOrders")}
            </p>
            <p className="mt-1 text-[13px] text-muted">{t("noOrdersDesc")}</p>
          </div>
        ) : usesWeeklyData ? (
          weeklyOrders.map((item) => {
            const count = item.orderCount;
            const height = count > 0 ? Math.round((count / maxWeeklyCount) * 100) : 0;
            const isActive = count > 0;

            return (
              <div
                key={item.label}
                title={`${item.label}: ${count} ${t("ordersLabel")}`}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="h-5 text-[11px] font-bold text-primary-heading">
                  {isActive ? count : ""}
                </div>
                <div className="relative flex h-[210px] w-full max-w-[42px] items-end overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="w-full rounded-full bg-primary transition-all duration-700 group-hover:bg-primary/80"
                    style={{ height: `${isActive ? Math.max(height, 8) : 0}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-muted">
                  {item.label}
                </span>
              </div>
            );
          })
        ) : (
          MONTHS.map(({ key, en, kh }) => {
            const label = lang === "kh" ? kh : en;
            const item = dataMap[key];
            const count = item?.count ?? 0;
            const height = item?.value ?? 0;
            const isActive = count > 0;

            return (
              <div
                key={key}
                title={`${label}: ${count} ${t("ordersLabel")}`}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="h-5 text-[11px] font-bold text-primary-heading">
                  {isActive ? count : ""}
                </div>
                <div className="relative flex h-[210px] w-full max-w-[18px] items-end overflow-hidden rounded-full bg-primary/10">
                  <div
                    className="w-full rounded-full bg-primary transition-all duration-700 group-hover:bg-primary/80"
                    style={{ height: `${isActive ? Math.max(height, 8) : 0}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-muted">
                  {label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
