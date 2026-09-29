"use client";

import Image from "next/image";
import Link from "next/link";
import { normalizeUserRole, ROLES } from "@/constants/role";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n/I18nContext";

const HERO_TEXT = {
  "crop.hero.description": {
    en: "Connect directly with trusted local farmers or source premium produce for your business. Kasephal simplifies agricultural trade with fair pricing, secure contracts, and a reliable supply chain.",
    kh: "ភ្ជាប់ដោយផ្ទាល់ជាមួយកសិករក្នុងស្រុកដែលអាចទុកចិត្តបាន ឬទទួលបានផលិតផលកំពូលសម្រាប់អាជីវកម្មរបស់អ្នក។ កសិផលធ្វើឱ្យពាណិជ្ជកម្មកសិកម្មកាន់តែងាយស្រួល ដោយតម្លៃត្រឹមត្រូវ កិច្ចសន្យាសុវត្ថិភាព និងខ្សែសង្វាក់ផ្គត់ផ្គង់ដែលអាចទុកចិត្តបាន។",
  },
  "cropDemands.manageOwn": {
    en: "Manage Own Crop Demand",
    kh: "គ្រប់គ្រងតម្រូវការដំណាំផ្ទាល់ខ្លួន",
  },
} as const;

function getHeroText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  return (key: string) =>
    HERO_TEXT[key as keyof typeof HERO_TEXT]?.[lang] ?? key;
}

export default function HeroSection() {
  const { data: session } = useSession();
  const { language } = useI18n();
  const t = getHeroText(language);
  const role = normalizeUserRole(session?.user?.role);

  return (
    <section className="mt-6 px-3 sm:px-4 md:px-6">
      <div className="relative z-0 mx-auto -mt-27.75 h-75 w-full overflow-hidden rounded-[20px] pt-12 sm:h-90 md:h-100 md:rounded-[28px]">
        <Image
          src="/assets/nav-bar/navbar_bg_image.png"
          alt="Hero Background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="relative z-10 flex h-full items-center justify-center text-center text-white sm:px-8 md:px-12 lg:px-20">
          <div className="flex w-full max-w-194.5 flex-col items-center gap-1 md:gap-3">
            <div className="flex flex-row items-center justify-center gap-2">
              {/* Title is always English, never translated */}
              <p className="text-[22px] font-black leading-none sm:text-[28px] md:text-[34px] lg:text-[36px]">
                Crop Demands
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

            {/* Khmer subtitle is always hardcoded like the homepage hero Khmer line */}
            <h1 className="font-khmer text-4xl font-black text-secondary sm:text-5xl md:text-6xl lg:text-[60px]">
              តម្រូវការផលិតផលដំណាំ
            </h1>

            <p
              className={`max-w-165 text-sm font-medium leading-relaxed text-white/90 sm:text-base lg:text-lg ${
                language === "kh" ? "font-khmer" : "font-thicccboi"
              }`}
            >
              {t("crop.hero.description")}
            </p>

            {role === ROLES.BUYER || role === ROLES.GOVERNMENT ? (
              <Link
                href="/crop-demands-management"
                className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-secondary px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-primary-heading no-underline shadow-md transition-all duration-200 hover:bg-secondary/90 active:bg-secondary/95"
              >
                <span className="font-khmer">{t("cropDemands.manageOwn")}</span>
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
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
