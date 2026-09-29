"use client";

import { useI18n } from "@/lib/i18n/I18nContext";
import type {
  TopValueCrop,
  TopVolumeCrop,
} from "@/services/crop-product.service";

type Props = {
  topValueCrops: TopValueCrop[];
  topVolumeCrops: TopVolumeCrop[];
};

const LEADING_TEXT = {
  leadingCrops: { en: "Leading Crops", kh: "ដំណាំឈានមុខ" },
  byValue: { en: "Top by Value", kh: "កំពូលតាមតម្លៃ" },
  byVolume: { en: "Top by Volume", kh: "កំពូលតាមបរិមាណ" },
  rank: { en: "Rank", kh: "លំដាប់" },
  crop: { en: "Crop", kh: "ដំណាំ" },
  value: { en: "Value", kh: "តម្លៃ" },
  volume: { en: "Volume", kh: "បរិមាណ" },
  noData: { en: "No data available.", kh: "មិនមានទិន្នន័យ។" },
} as const;

export default function LeadingCropCard({
  topValueCrops,
  topVolumeCrops,
}: Props) {
  const { language } = useI18n();
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const t = (key: keyof typeof LEADING_TEXT) => LEADING_TEXT[key][lang];

  return (
    <div
      className={`rounded-[20px] border border-light-grey bg-white p-6 shadow-sm ${lang === "kh" ? "font-khmer" : ""}`}
    >
      <p className="text-[12px] font-bold uppercase tracking-wide text-primary">
        {t("leadingCrops")}
      </p>

      {/* Top by Value */}
      <div className="mt-4">
        <h3 className="text-[16px] font-bold text-primary-heading">
          {t("byValue")}
        </h3>
        <div className="mt-3 overflow-hidden rounded-[12px] bg-[#F7F9FB]">
          {topValueCrops.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">
              {t("noData")}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#D6DEE8]">
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    {t("rank")}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    {t("crop")}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    {t("value")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topValueCrops.map((item) => (
                  <tr
                    key={item.rank}
                    className="border-b border-[#D6DEE8] last:border-none"
                  >
                    <td className="px-4 py-2 text-[13px] font-semibold text-primary-heading">
                      #{item.rank}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-primary-heading">
                      {item.name}
                    </td>
                    <td className="px-4 py-2 text-[13px] font-semibold text-primary">
                      {item.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Top by Volume */}
      <div className="mt-6">
        <h3 className="text-[16px] font-bold text-primary-heading">
          {t("byVolume")}
        </h3>
        <div className="mt-3 overflow-hidden rounded-[12px] bg-[#F7F9FB]">
          {topVolumeCrops.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-muted">
              {t("noData")}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#D6DEE8]">
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    {t("rank")}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    {t("crop")}
                  </th>
                  <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-muted">
                    {t("volume")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {topVolumeCrops.map((item) => (
                  <tr
                    key={item.rank}
                    className="border-b border-[#D6DEE8] last:border-none"
                  >
                    <td className="px-4 py-2 text-[13px] font-semibold text-primary-heading">
                      #{item.rank}
                    </td>
                    <td className="px-4 py-2 text-[13px] text-primary-heading">
                      {item.name}
                    </td>
                    <td className="px-4 py-2 text-[13px] font-semibold text-primary">
                      {item.volume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
