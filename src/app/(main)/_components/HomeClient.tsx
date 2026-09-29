"use client";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { CropDemandPost } from "@/types/crop-demand";
import { useSession } from "next-auth/react";
import Join_buyer from "@/components/layout/Join_buyer";
import Join_farmer from "@/components/layout/Join_farmer";
import Join_kasephal from "@/components/layout/Join_kasephal";
import Gotodashboard from "@/components/layout/Gotodashboard";
import ProtectedCropGrid from "@/components/layout/ProtectedCropGrid";
import HowItWorks from "./HowItWorks";
import { useI18n } from "@/lib/i18n/I18nContext";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const viewOpts = { once: true, amount: 0.2 };

function CropCardSkeleton() {
  return (
    <div className="h-80 w-full animate-pulse rounded-[20px] border border-light-grey bg-white p-4 shadow-sm">
      <div className="h-42.5 rounded-4xl bg-gray-200" />
      <div className="mt-4 space-y-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="mt-6 flex items-center justify-between">
          <div className="h-5 w-20 rounded bg-gray-200" />
          <div className="h-9 w-24 rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function CropGridFallback() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <CropCardSkeleton key={index} />
      ))}
    </div>
  );
}

const HOME_TEXT = {
  "home.hero.originalNatural": {
    en: "Original & Natural",
    kh: "ដើមកំណើត និងធម្មជាតិ",
  },
  "home.hero.title": {
    en: "KASEPHAL",
    kh: "កសិផល",
  },
  "home.hero.subtitle": {
    en: "Connecting Cambodian farmers, buyers, and agricultural stakeholders through a trusted digital marketplace.",
    kh: "ភ្ជាប់កសិករ អ្នកទិញ និងភាគីពាក់ព័ន្ធក្នុងវិស័យកសិកម្មតាមរយៈទីផ្សារឌីជីថលដែលអាចទុកចិត្តបាន។",
  },
  "home.dashboardOverview": {
    en: "Dashboard Overview",
    kh: "ផ្ទាំងគ្រប់គ្រង",
  },
  "home.marketplace.label": {
    en: "Marketplace",
    kh: "ទីផ្សារ",
  },
  "home.marketplace.title": {
    en: "Explore Cambodia's Agricultural Marketplace",
    kh: "ស្វែងយល់អំពីទីផ្សារកសិផលកម្ពុជា",
  },
  "home.marketplace.description": {
    en: "Browse a wide range of crops and agricultural products from trusted farmers across Cambodia.",
    kh: "ស្វែងរកដំណាំ និងផលិតផលកសិកម្មជាច្រើនពីកសិករដែលអាចទុកចិត្តបានទូទាំងប្រទេសកម្ពុជា។",
  },
  "home.sourcing.label": {
    en: "Sourcing",
    kh: "ការផ្គត់ផ្គង់",
  },
  "home.availableHarvests.title": {
    en: "Available Harvests",
    kh: "ផលប្រមូលផលដែលមាន",
  },
  "home.availableHarvests.description": {
    en: "Discover fresh harvests available directly from farmers and agricultural producers.",
    kh: "ស្វែងរកផលប្រមូលផលស្រស់ៗដែលមានដោយផ្ទាល់ពីកសិករ និងអ្នកផលិតកសិកម្ម។",
  },
  "home.cropDemands.label": {
    en: "Crop Demands",
    kh: "តម្រូវការកសិផល",
  },
  "home.cropDemands.title": {
    en: "Current Buyer Demands",
    kh: "តម្រូវការបច្ចុប្បន្នរបស់អ្នកទិញ",
  },
  "home.cropDemands.description": {
    en: "View active crop demand requests from buyers and agribusinesses.",
    kh: "មើលសំណើតម្រូវការកសិផលសកម្មពីអ្នកទិញ និងអាជីវកម្មកសិកម្ម។",
  },
  "home.empowering.title": {
    en: "Empowering Every Harvest",
    kh: "ពង្រឹងគ្រប់ការប្រមូលផល",
  },
  "home.empowering.description": {
    en: "Supporting farmers with opportunities, connections, and market access.",
    kh: "គាំទ្រកសិករដោយផ្តល់ឱកាស ការតភ្ជាប់ និងការចូលដំណើរការទីផ្សារ។",
  },
  "home.empowering.easy": { en: "Easy", kh: "ងាយស្រួល" },
  "home.empowering.harvesting": { en: "Harvesting", kh: "ការប្រមូលផល" },
  "home.empowering.fresh": { en: "Fresh", kh: "ស្រស់" },
  "home.empowering.produce": { en: "Produce", kh: "កសិផល" },
  "home.empowering.hardworking": { en: "Hardworking", kh: "ខិតខំប្រឹងប្រែង" },
  "home.empowering.hands": { en: "Hands", kh: "ដៃអ្នកកសិករ" },
  "home.getStarted.label": { en: "Get Started", kh: "ចាប់ផ្តើម" },
  "home.getStarted.title": {
    en: "Join Cambodia's Digital Agriculture Marketplace",
    kh: "ចូលរួមទីផ្សារកសិកម្មឌីជីថលរបស់កម្ពុជា",
  },
  "home.getStarted.description": {
    en: "Create an account today and connect with farmers, buyers, and agricultural organizations.",
    kh: "បង្កើតគណនីថ្ងៃនេះ និងភ្ជាប់ជាមួយកសិករ អ្នកទិញ និងអង្គការកសិកម្ម។",
  },
  /* Crop Cards Translations */
  "home.crop.pepper.title": { en: "Black Pepper", kh: "ម្រេចខ្មៅ" },
  "home.crop.pepper.subtitle": { en: "Kampot • SPICES", kh: "កំពត • គ្រឿងទេស" },
  "home.crop.cashew.title": { en: "Raw Cashew Nuts", kh: "គ្រាប់ស្វាយចន្ទីឆៅ" },
  "home.crop.cashew.subtitle": {
    en: "Kampong Thom • NUTS",
    kh: "កំពង់ធំ • គ្រាប់ធញ្ញជាតិ",
  },
  "home.crop.jasmineRice.title": { en: "Jasmine Rice", kh: "អង្ករផ្ការំដួល" },
  "home.crop.jasmineRice.subtitle": {
    en: "Battambang • RICE",
    kh: "បាត់ដំបង • អង្ករ",
  },
  "home.crop.mungBeans.title": { en: "Green Mung Beans", kh: "សណ្តែកខៀវ" },
  "home.crop.mungBeans.subtitle": {
    en: "Prey Veng • BEANS",
    kh: "ព្រៃវែង • សណ្តែក",
  },
  "home.crop.whiteRice.title": { en: "Premium White Rice", kh: "អង្ករប្រណិត" },
  "home.crop.whiteRice.subtitle": {
    en: "Siem Reap • RICE",
    kh: "សៀមរាប • អង្ករ",
  },
  "home.crop.coffee.title": { en: "Coffee Beans", kh: "គ្រាប់កាហ្វេ" },
  "home.crop.coffee.subtitle": {
    en: "Mondulkiri • COFFEE",
    kh: "មណ្ឌលគិរី • កាហ្វេ",
  },
} as const;

function getHomeText(language: string) {
  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  return (key: string) =>
    HOME_TEXT[key as keyof typeof HOME_TEXT]?.[lang] ?? key;
}

const cropCards = [
  {
    titleKey: "home.crop.pepper.title",
    subtitleKey: "home.crop.pepper.subtitle",
    image: "/assets/home_page/image01.png",
  },
  {
    titleKey: "home.crop.cashew.title",
    subtitleKey: "home.crop.cashew.subtitle",
    image: "/assets/home_page/image02.png",
  },
  {
    titleKey: "home.crop.jasmineRice.title",
    subtitleKey: "home.crop.jasmineRice.subtitle",
    image: "/assets/home_page/image03.png",
  },
  {
    titleKey: "home.crop.mungBeans.title",
    subtitleKey: "home.crop.mungBeans.subtitle",
    image: "/assets/home_page/image05.png",
  },
  {
    titleKey: "home.crop.whiteRice.title",
    subtitleKey: "home.crop.whiteRice.subtitle",
    image: "/assets/home_page/image04.png",
  },
  {
    titleKey: "home.crop.coffee.title",
    subtitleKey: "home.crop.coffee.subtitle",
    image: "/assets/home_page/image06.png",
  },
];

type Props = {
  cropDemands: CropDemandPost[];
};

export default function HomeClient({ cropDemands }: Props) {
  const { language } = useI18n();
  const t = getHomeText(language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const role = session?.user?.role?.toUpperCase() ?? null;

  const dashboardPath = "/overview-dashboard";
  const cardDestination =
    role === "FARMER"
      ? "/listing-crop-demands"
      : role === "BUYER" || role == "GOVERNMENT"
        ? "/listing-product"
        : "/";

  return (
    <div
      className={`w-full min-h-screen overflow-x-clip bg-background ${fontClass}`}
    >
      {/* Hero */}
      <div className="flex justify-center mt-6 px-6 max-[480px]:px-3">
        <div className="relative w-full -mt-27.75 h-160 overflow-hidden rounded-[28px] z-0 max-[480px]:h-140 max-[480px]:rounded-[22px]">
          <Image
            src="/assets/nav-bar/navbar_bg_image.png"
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />

          <div className="relative z-10 pt-37.5 px-20 text-white max-[480px]:px-5">
            <motion.div
              className="relative inline-block mb-8 max-[480px]:mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <p className="relative text-[20px] font-bold max-[480px]:text-[15px]">
                {t("home.hero.originalNatural")}
              </p>
              <Image
                src="/assets/home_page/vector.png"
                alt="Underline"
                width={215}
                height={26}
                className="absolute left-0 top-7 max-[480px]:top-6 max-[480px]:w-40"
                priority
              />
            </motion.div>

            <motion.div
              className="flex flex-row items-center gap-3 max-[480px]:gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            >
              <h1 className="title-navbar text-white max-[480px]:text-[42px] max-[480px]:leading-none">
                {t("home.hero.title")}
              </h1>
              <Image
                src="/assets/home_page/image.png"
                alt=""
                width={60}
                height={60}
                className="object-contain shrink-0 max-[480px]:h-10 max-[480px]:w-10"
                priority
              />
            </motion.div>

            <motion.h1
              className="font-khmer font-bold text-[60px] leading-[1.1] text-secondary max-[480px]:mt-3 max-[480px]:text-[27px] max-[480px]:leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
            >
              ទីផ្សារកសិផលឌីជីថលកម្ពុជា
            </motion.h1>

            <motion.p
              className="mt-4 max-w-162.5 text-lg max-[480px]:max-w-full max-[480px]:text-[15px] max-[480px]:leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            >
              {t("home.hero.subtitle")}
            </motion.p>

            <motion.div
              className="flex flex-row mt-5 gap-10 max-[480px]:mt-6 max-[480px]:flex-col max-[480px]:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            >
              {!isLoggedIn ? (
                <div className="mt-5 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <Join_kasephal />
                  <Gotodashboard />
                </div>
              ) : (
                <div className="mt-5 max-[480px]:mt-0">
                  <Link
                    href={dashboardPath}
                    className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-[18px] font-medium transition hover:bg-secondary max-[480px]:w-full max-[480px]:justify-center max-[480px]:text-[16px]"
                  >
                    {t("home.dashboardOverview")}
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decor */}
      <div className="max-[480px]:hidden">
        <Image
          src="/assets/home_page/bg02.png"
          alt=""
          width={260}
          height={260}
          className="absolute top-175 right-0 opacity-40 pointer-events-none"
        />
        <Image
          src="/assets/home_page/background.png"
          alt=""
          width={260}
          height={260}
          className="absolute -bottom-162.5 left-0 opacity-40 pointer-events-none"
        />
      </div>

      {/* Marketplace */}
      <section className="relative overflow-hidden px-4 py-16 md:px-6 max-[480px]:py-12">
        <div className="mx-auto w-full md:px-8 xl:px-25">
          <div className="mb-4 grid grid-cols-1 items-end gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-8">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={viewOpts}
            >
              <p className="text-primary text-[14px] uppercase tracking-wide md:text-[18px] max-[480px]:text-[13px]">
                {t("home.marketplace.label")}
              </p>
              <h2 className="text-dark-grey font-black leading-[0.95] md:text-[42px] md:mt-4 lg:text-[46px] max-[480px]:mt-2 max-[480px]:text-[30px] max-[480px]:leading-[1.05]">
                {t("home.marketplace.title")}
              </h2>
              <p className="text-secondary-body text-[14px] font-medium leading-[1.45] md:mt-4 md:text-[20px] max-[480px]:mt-3 max-[480px]:leading-[1.55]">
                {t("home.marketplace.description")}
              </p>
            </motion.div>

            {/* Header image card — cropCards[1] */}
            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={viewOpts}
              className="relative h-45 overflow-hidden rounded-xl md:h-50 lg:h-45 max-[480px]:h-56"
            >
              <Link href={cardDestination} className="block w-full h-full">
                <Image
                  src={cropCards[1].image}
                  alt={t(cropCards[1].titleKey)}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-5 text-white md:bottom-5 md:left-6">
                  <h3 className="text-[16px] font-bold md:text-[18px]">
                    {t(cropCards[1].titleKey)}
                  </h3>
                  <p className="text-[11px] text-white/80 md:text-[12px]">
                    {t(cropCards[1].subtitleKey)}
                  </p>
                </div>
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
          >
            {/* Large featured card — cropCards[0] */}
            <motion.div
              variants={fadeUp}
              custom={0}
              className="relative h-80 overflow-hidden rounded-xl md:h-88 lg:col-span-2 lg:row-span-2 max-[480px]:h-72"
            >
              <Link href={cardDestination} className="block w-full h-full">
                <Image
                  src={cropCards[0].image}
                  alt={t(cropCards[0].titleKey)}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-5 left-5 text-white md:bottom-6 md:left-7">
                  <h3 className="text-[16px] font-bold md:text-[18px]">
                    {t(cropCards[0].titleKey)}
                  </h3>
                  <p className="text-[11px] text-white/80 md:text-[12px]">
                    {t(cropCards[0].subtitleKey)}
                  </p>
                </div>
              </Link>
            </motion.div>

            {/* Smaller cards — cropCards[2..5] */}
            {cropCards.slice(2).map((card, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i + 1}
                className="relative h-55 overflow-hidden rounded-xl md:h-42 max-[480px]:h-56"
              >
                <Link href={cardDestination} className="block w-full h-full">
                  <Image
                    src={card.image}
                    alt={t(card.titleKey)}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-5 text-white md:bottom-5">
                    <h3 className="text-[16px] font-bold md:text-[18px]">
                      {t(card.titleKey)}
                    </h3>
                    <p className="text-[11px] text-white/80 md:text-[12px]">
                      {t(card.subtitleKey)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
            className="mt-8 flex justify-center md:mt-10"
          >
            {!isLoggedIn ? <Join_farmer /> : null}
          </motion.div>
        </div>
      </section>

      {/* Available Harvests */}
      <section className="relative overflow-hidden px-4 py-16 md:px-6 max-[480px]:py-12">
        <div className="mx-auto w-full md:px-8 xl:px-25">
          <motion.div
            className="text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
          >
            <p className="text-primary text-[14px] uppercase tracking-wide md:text-[18px] max-[480px]:text-[13px]">
              {t("home.sourcing.label")}
            </p>
            <h1 className="text-dark-grey font-black leading-[0.95] md:text-[42px] md:mt-4 lg:text-[46px] max-[480px]:mt-2 max-[480px]:text-[30px] max-[480px]:leading-[1.05]">
              {t("home.availableHarvests.title")}
            </h1>
            <p className="text-secondary-body text-[14px] font-medium leading-[1.45] md:mt-4 md:text-[20px] max-[480px]:mx-auto max-[480px]:mt-3 max-[480px]:leading-[1.55]">
              {t("home.availableHarvests.description")}
            </p>
          </motion.div>

          <div className="max-[480px]:hidden">
            <Image
              src="/assets/home_page/bg2.png"
              alt=""
              width={260}
              height={260}
              className="absolute top-15 right-0 opacity-40 pointer-events-none"
            />
            <Image
              src="/assets/home_page/bg1.png"
              alt=""
              width={260}
              height={260}
              className="absolute -bottom-12.5 left-0 opacity-40 pointer-events-none"
            />
          </div>

          <motion.div
            className="relative flex h-200 justify-center max-[480px]:mt-8 max-[480px]:h-75"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
          >
            <Image
              src="/assets/home_page/group-image.png"
              alt="Available Harvests"
              width={1100}
              height={800}
              className="absolute object-contain max-[480px]:h-full max-[480px]:w-full"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
            className="flex items-center justify-center"
          >
            {!isLoggedIn ? <Join_buyer /> : null}
          </motion.div>
        </div>
      </section>

      {/* Crop Demands */}
      <section className="relative overflow-hidden px-4 py-16 md:px-6 max-[480px]:py-12">
        <div className="mx-auto w-full md:px-8 xl:px-25">
          <motion.div
            className="flex justify-center items-center flex-col max-[480px]:text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
          >
            <p className="text-primary text-[14px] uppercase tracking-wide md:text-[18px] max-[480px]:text-[13px]">
              {t("home.cropDemands.label")}
            </p>
            <h1 className="text-dark-grey font-black leading-[0.95] md:text-[42px] md:mt-4 lg:text-[46px] max-[480px]:mt-2 max-[480px]:text-[30px] max-[480px]:leading-[1.05]">
              {t("home.cropDemands.title")}
            </h1>
            <p className="text-secondary-body text-[14px] font-medium leading-[1.45] md:mt-4 md:text-[20px] max-[480px]:mt-3 max-[480px]:leading-[1.55]">
              {t("home.cropDemands.description")}
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewOpts}
          className="mx-auto mt-12 w-full md:px-8 xl:px-25 max-[480px]:mt-8"
        >
          <Suspense fallback={<CropGridFallback />}>
            <ProtectedCropGrid baseCrop={cropDemands} isLogin={isLoggedIn} />
          </Suspense>
        </motion.div>
      </section>

      {/* How It Works */}
      <motion.section
        id="how-it-work"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewOpts}
      >
        <HowItWorks />
      </motion.section>

      {/* Empowering Every Harvest */}
      <section className="relative overflow-hidden px-4 py-16 md:px-6 max-[480px]:py-12">
        <div className="mx-auto w-full md:px-8 xl:px-25">
          <motion.div
            className="flex flex-col items-center text-center"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
          >
            <p className="text-primary text-[14px] uppercase tracking-wide md:text-[18px] max-[480px]:text-[13px]">
              {t("home.sourcing.label")}
            </p>
            <h1 className="text-dark-grey font-black leading-[0.95] md:text-[42px] md:mt-4 lg:text-[46px] max-[480px]:mt-2 max-[480px]:text-[30px] max-[480px]:leading-[1.05]">
              {t("home.empowering.title")}
            </h1>
            <p className="text-secondary-body text-[14px] font-medium leading-[1.45] md:mt-4 md:text-[20px] max-[480px]:mt-3 max-[480px]:leading-[1.55]">
              {t("home.empowering.description")}
            </p>
          </motion.div>

          <motion.div
            className="mt-7 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewOpts}
          >
            {[
              {
                src: "/assets/home_page/card-image01.png",
                alt: "Easy Harvesting",
                title: t("home.empowering.easy"),
                subtitle: t("home.empowering.harvesting"),
              },
              {
                src: "/assets/home_page/card-image02.jpg",
                alt: "Fresh Produce",
                title: t("home.empowering.fresh"),
                subtitle: t("home.empowering.produce"),
              },
              {
                src: "/assets/home_page/card-image03.jpg",
                alt: "Hardworking Hands",
                title: t("home.empowering.hardworking"),
                subtitle: t("home.empowering.hands"),
              },
            ].map((card, i) => (
              <motion.div
                key={card.alt}
                variants={fadeUp}
                custom={i}
                className="relative h-95 w-full overflow-hidden rounded-lg sm:h-115 lg:h-180 max-[480px]:h-80"
              >
                <Image
                  src={card.src}
                  alt={card.alt}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute flex flex-col font-black bottom-8 left-6 z-10 sm:bottom-10 sm:left-8 max-[480px]:bottom-7 max-[480px]:left-5">
                  <h2 className="text-[24px] flex leading-[0.95] text-white md:text-[28px]">
                    {card.title}
                  </h2>
                  <h2 className="text-[24px] flex leading-[0.95] text-white md:text-[28px]">
                    {card.subtitle}
                  </h2>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Get Started CTA */}
      {!isLoggedIn ? (
        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewOpts}
          className="flex flex-col gap-4 sm:flex-row lg:justify-end"
        >
          <section className="relative overflow-hidden bg-[#F9EAC9] px-4 py-16 md:px-6 max-[480px]:py-12">
            <div className="mx-auto w-full md:px-8 xl:px-25">
              <Image
                src="/assets/home_page/bg_image.png"
                alt="Background Pattern"
                fill
                className="object-cover opacity-20"
              />
              <div className="relative z-10 mx-auto w-full">
                <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_0.8fr] max-[480px]:gap-8">
                  <motion.div
                    variants={fadeLeft}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewOpts}
                    className="max-[480px]:text-center"
                  >
                    <p className="text-primary text-[14px] uppercase tracking-wide md:text-[18px] max-[480px]:text-[13px]">
                      {t("home.getStarted.label")}
                    </p>
                    <h2 className="text-dark-grey font-black leading-[0.95] md:text-[42px] md:mt-4 lg:text-[46px] max-[480px]:mt-2 max-[480px]:text-[30px] max-[480px]:leading-[1.05]">
                      {t("home.getStarted.title")}
                    </h2>
                    <p className="text-secondary-body text-[14px] font-medium leading-[1.45] md:mt-4 md:text-[20px] max-[480px]:mt-3 max-[480px]:leading-[1.55]">
                      {t("home.getStarted.description")}
                    </p>
                  </motion.div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:gap-8 max-[480px]:items-center max-[480px]:justify-center">
                    <Join_farmer />
                    <Join_buyer />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      ) : null}
    </div>
  );
}
