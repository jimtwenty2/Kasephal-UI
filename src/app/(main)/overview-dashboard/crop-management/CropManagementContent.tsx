"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";

import { useI18n } from "@/lib/i18n/I18nContext";

const CROP_MANAGEMENT_TEXT = {
  government: {
    en: "Government",
    kh: "រដ្ឋាភិបាល",
  },
  title: {
    en: "Crop Management",
    kh: "ការគ្រប់គ្រងដំណាំ",
  },
  description: {
    en: "Update crop names and crop types from one dedicated dashboard page.",
    kh: "គ្រប់គ្រង និងកែប្រែឈ្មោះដំណាំ និងប្រភេទដំណាំពីទំព័រគ្រប់គ្រងតែមួយ។",
  },
  sectionLabel: {
    en: "Type of Crop",
    kh: "ប្រភេទដំណាំ",
  },
  sectionTitle: {
    en: "Crop Management",
    kh: "ការគ្រប់គ្រងដំណាំ",
  },
} as const;

export default function CropManagementContent() {
  const { language } = useI18n();

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  const t = (key: keyof typeof CROP_MANAGEMENT_TEXT) =>
    CROP_MANAGEMENT_TEXT[key][lang];

  return (
    <>
      <div className="relative z-10 mt-6 min-w-full px-6">
        <div className="relative -mt-[111px] h-75 w-full overflow-hidden rounded-[28px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            priority
            className="object-cover"
          />

          <div className="relative z-10 mt-16 px-8 py-8 text-white md:px-20">
            <Link
              href="/overview-dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>

            <div className="mt-5">
              <h1 className="text-[24px] font-bold uppercase text-white">
                {t("government")}
              </h1>

              <h2 className="mt-1 text-[48px] font-bold leading-none text-secondary">
                {t("title")}
              </h2>

              <p className="mt-3 max-w-[900px] text-[18px] font-medium">
                {t("description")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 px-4 pb-10 pt-6 lg:px-[200px]">
        <p className="text-[14px] font-bold uppercase tracking-wide text-primary md:text-[16px]">
          {t("sectionLabel")}
        </p>

        <h1 className="mt-2 text-[12px] font-black leading-none text-primary-heading md:text-[32px]">
          {t("sectionTitle")}
        </h1>
      </section>
    </>
  );
}
