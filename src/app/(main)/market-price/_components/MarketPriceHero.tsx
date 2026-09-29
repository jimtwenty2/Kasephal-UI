"use client";

import Image from "next/image";
import { useMarketPriceText } from "./marketPriceText";

export default function MarketPriceHero() {
  const { t, fontClass } = useMarketPriceText();

  return (
    <section className={`mt-6 px-4 md:px-6 ${fontClass}`}>
      <div className="relative mx-auto -mt-27.75 h-75 w-full overflow-hidden rounded-[20px] sm:h-90 md:h-100.75 md:rounded-[28px]">
        {/* Background Image */}
        <Image
          src="/assets/nav-bar/navbar_bg_image.png"
          alt="Hero Background"
          fill
          priority
          className="object-cover"
        />

        {/* Content */}
        <div className="relative z-10 flex h-full items-center justify-center px-4 text-center text-white sm:px-8 md:px-12 lg:px-20">
          <div className="mt-12 flex w-full max-w-194.5 flex-col items-center gap-1 md:gap-3">
            {/* Title */}
            <div className="relative">
              <div className="flex items-center justify-center">
                <p className="pr-2 text-[22px] font-black leading-none sm:text-[28px] md:text-[34px] lg:text-[36px]">
                  {t("market.hero.title")}
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

              {/* Underline */}
              <Image
                src="/assets/home_page/vector.png"
                alt="Underline"
                width={215}
                height={26}
                priority
                className="absolute left-1/2 top-[30px] w-[120px] -translate-x-1/2 sm:w-[160px] md:top-[38px] md:w-[215px] pt-2"
              />

              <h1 className="mt-5 font-khmer text-[36px] font-black leading-none text-[#F9C156] sm:text-[48px] md:text-[60px] lg:text-[68px]">
                {t("market.hero.khTitle")}
              </h1>
            </div>

            {/* Description */}
            <p className="max-w-[340px] text-[13px] font-medium leading-[1.5] text-white sm:max-w-[520px] sm:text-[15px] md:max-w-[640px] md:text-[16px] lg:text-[18px]">
              {t("market.hero.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}