"use client";

import {
  ChartBarIcon,
  TagIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useI18n } from "@/lib/i18n/I18nContext";

const TEXT = {
  heading: { en: "Crop Summary", kh: "សង្ខេបដំណាំ" },
  totalCropNames: { en: "Total Crop Names", kh: "ចំនួនឈ្មោះដំណាំ" },
  totalCropTypes: { en: "Total Crop Types", kh: "ចំនួនប្រភេទដំណាំ" },
  totalContracts: { en: "Total Contracts", kh: "កិច្ចសន្យាសរុប" },
  totalOrders: { en: "Total Orders", kh: "សរុបការបញ្ជាទិញ" },
} as const;

interface Props {
  totalCropNames: number;
  totalCropTypes: number;
  totalContracts: number;
  totalOrders: number;
}

export default function PreviousMonthComparison({
  totalCropNames,
  totalCropTypes,
  totalContracts,
  totalOrders,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof TEXT) => TEXT[key][lang];

  const stats = [
    {
      title: t("totalCropNames"),
      value: totalCropNames,
      sub: lang === "kh" ? "ដំណាំ" : "Crops",
      icon: TagIcon,
    },
    {
      title: t("totalCropTypes"),
      value: totalCropTypes,
      sub: lang === "kh" ? "ប្រភេទ" : "Types",
      icon: ChartBarIcon,
    },
    {
      title: t("totalContracts"),
      value: totalContracts,
      sub: lang === "kh" ? "កិច្ចសន្យា" : "Contracts",
      icon: DocumentTextIcon,
    },
    {
      title: t("totalOrders"),
      value: totalOrders,
      sub: lang === "kh" ? "ការបញ្ជាទិញ" : "Orders",
      icon: ClipboardDocumentListIcon,
    },
  ];

  return (
    <div
      className={`mt-5 rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${
        lang === "kh" ? "font-khmer" : ""
      }`}
    >
      <h2 className="text-[24px] font-bold text-primary-heading">
        {t("heading")}
      </h2>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="flex items-center justify-between rounded-[16px] border border-[#EEF1F4] bg-white p-5 shadow-sm"
            >
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-secondary-body">
                  {item.title}
                </p>
                <h3 className="mt-3 text-[28px] font-bold leading-none text-primary-heading">
                  {item.value.toLocaleString()}
                </h3>
                <p className="mt-2 text-[14px] font-semibold text-secondary-body">
                  {item.sub}
                </p>
              </div>
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-[#E7F1EC]">
                <Icon className="h-7 w-7 text-primary" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
