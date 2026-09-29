"use client";

import Image from "next/image";
import Link from "next/link";
import { ROLES, type UserRole } from "@/constants/role";
import { useI18n } from "@/lib/i18n/I18nContext";

const CROP_HERO_TEXT = {
  "crop.hero.description": {
    en: "Explore quality agricultural products from trusted Cambodian farmers and connect directly with suppliers across the country.",
    kh: "ស្វែងរកផលិតផលកសិកម្មដែលមានគុណភាពពីកសិករខ្មែរដែលអាចទុកចិត្តបាន និងភ្ជាប់ដោយផ្ទាល់ជាមួយអ្នកផ្គត់ផ្គង់ទូទាំងប្រទេស។",
  },

  "cropProducts.manageOwn": {
    en: "Manage My Products",
    kh: "គ្រប់គ្រងផលិតផលរបស់ខ្ញុំ",
  },
} as const;

function getCropHeroText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";

  return (key: string) =>
    CROP_HERO_TEXT[key as keyof typeof CROP_HERO_TEXT]?.[lang] ?? key;
}

type Props = {
  role: UserRole | null;
};

export default function HeroSection({ role }: Props) {
  const { language } = useI18n();
  const t = getCropHeroText(language);

  return (
    <section className="mt-6 px-3 sm:px-4 md:px-6">
      <div className="relative z-0 mx-auto -mt-27.75 h-75 w-full overflow-hidden rounded-[20px] pt-12 sm:h-90 md:h-100 md:rounded-[28px]">
        {/* Background */}
        <Image
          src="/assets/nav-bar/navbar_bg_image.png"
          alt="Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center text-center text-white sm:px-8 md:px-12 lg:px-20">
          <div className="flex w-full max-w-194.5 flex-col items-center gap-1 md:gap-3">
            {/* English Title Always */}
            <div className="flex flex-row items-center justify-center gap-2">
              <p className="text-[22px] font-black leading-none sm:text-[28px] md:text-[34px] lg:text-[36px]">
                Crop Products
              </p>

              <Image
                src="/assets/home_page/image.png"
                alt="Leaf"
                width={60}
                height={60}
                priority
                className="mb-1 w-5.5 sm:w-15 md:w-15"
              />
            </div>

            {/* Khmer Subtitle Always */}
            <h1 className="font-khmer text-4xl font-black text-secondary sm:text-5xl md:text-6xl lg:text-[60px]">
              ផលិតផលដំណាំ
            </h1>

            {/* Description Translated */}
            <p
              className={`max-w-165 text-sm font-medium leading-relaxed text-white/90 sm:text-base lg:text-lg ${language === "kh" ? "font-khmer" : "font-thicccboi"
                }`}
            >
              {t("crop.hero.description")}
            </p>

            {/* CTA Button */}
            {role === ROLES.FARMER && (
              <Link
                href="/crop-product-management"
                className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-secondary px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-heading shadow-md transition-all duration-200 hover:bg-secondary/90 active:bg-secondary/95"
              >
                <span className="font-khmer">{t("cropProducts.manageOwn")}</span>

                <svg
                  className="h-4 w-4 stroke-[2.5]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}