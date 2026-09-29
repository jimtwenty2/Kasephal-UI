"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nContext";

const footerTranslation = {
  "footer.brand.alt": {
    en: "Kasephal Logo",
    kh: "ឡូហ្គោ កសិផល",
  },
  "footer.brand.title": {
    en: "Kasephal - Cambodia's Digital Crop Market.",
    kh: "កសិផល - ទីផ្សារដំណាំឌីជីថលរបស់កម្ពុជា",
  },
  "footer.brand.description": {
    en: "Kasephal connects Cambodian farmers directly with buyers, reducing middlemen to ensure fair trade and better market access.",
    kh: "កសិផលភ្ជាប់កសិករកម្ពុជាដោយផ្ទាល់ជាមួយអ្នកទិញ ដើម្បីកាត់បន្ថយឈ្មួញកណ្ដាល ធានាការជួញដូរដោយយុត្តិធម៌ និងបង្កើនការចូលដល់ទីផ្សារ។",
  },
  "footer.brand.mission": {
    en: "Through Kasephal, we aim to bring Cambodia's rich ផលានុផល (Phalanuphal)—the abundance of crops—to the global market, while supporting sustainable agriculture and strengthening rural livelihoods.",
    kh: "តាមរយៈកសិផល យើងមានគោលបំណងនាំយកផលានុផលដ៏សម្បូរបែបរបស់កម្ពុជា ទៅកាន់ទីផ្សារពិភពលោក ខណៈពេលគាំទ្រកសិកម្មប្រកបដោយចីរភាព និងពង្រឹងជីវភាពរស់នៅជនបទ។",
  },
  "footer.section.marketplace": {
    en: "MARKETPLACE",
    kh: "ទីផ្សារ",
  },
  "footer.nav.home": {
    en: "Home",
    kh: "ទំព័រដើម",
  },
  "footer.nav.cropProduct": {
    en: "Crop Product",
    kh: "ផលិតផលដំណាំ",
  },
  "footer.nav.cropDemand": {
    en: "Crop Demand",
    kh: "តម្រូវការដំណាំ",
  },
  "footer.nav.marketPrice": {
    en: "Market Price",
    kh: "តម្លៃទីផ្សារ",
  },
  "footer.nav.aboutUs": {
    en: "About Us",
    kh: "អំពីយើង",
  },
  "footer.nav.ourPartners": {
    en: "Our Partners",
    kh: "ដៃគូរបស់យើង",
  },
  "footer.nav.termsPrivacy": {
    en: "Terms & Privacy",
    kh: "លក្ខខណ្ឌ និងឯកជនភាព",
  },
  "footer.section.contactUs": {
    en: "CONTACT US",
    kh: "ទំនាក់ទំនងមកយើង",
  },
  "footer.contact.address": {
    en: "#12, St 323, Sangkat Boeung Kak II, Khan Toul Kork, Phnom Penh, Cambodia.",
    kh: "#12, ផ្លូវ 323, សង្កាត់បឹងកក់ទី ២, ខណ្ឌទួលគោក, រាជធានីភ្នំពេញ, កម្ពុជា។",
  },
  "footer.contact.phone1": {
    en: "093 379 803",
    kh: "093 379 803",
  },
  "footer.social.facebook": {
    en: "Facebook",
    kh: "ហ្វេសប៊ុក",
  },
  "footer.social.tiktok": {
    en: "TikTok",
    kh: "ទីកតុក",
  },
  "footer.social.telegram": {
    en: "Telegram",
    kh: "តេលេក្រាម",
  },
  "footer.social.youtube": {
    en: "YouTube",
    kh: "យូធូប",
  },
  "footer.legal.copyright": {
    en: "© 2026 Kasephal. All rights reserved. Built with pride in Cambodia.",
    kh: "© 2026 កសិផល រក្សាសិទ្ធិគ្រប់យ៉ាង បង្កើតឡើងដោយមោទនភាពនៅកម្ពុជា",
  },
  "footer.legal.privacyPolicy": {
    en: "Privacy Policy",
    kh: "គោលការណ៍ឯកជនភាព",
  },
  "footer.legal.termsOfService": {
    en: "Terms of Service",
    kh: "លក្ខខណ្ឌសេវាកម្ម",
  },
  "footer.legal.trustSafety": {
    en: "Trust & Safety",
    kh: "ទំនុកចិត្ត និងសុវត្ថិភាព",
  },
} as const;

const IconTelegram = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      d="M16,2c-7.732,0-14,6.268-14,14s6.268,14,14,14,14-6.268,14-14S23.732,2,16,2Zm6.489,9.521c-.211,2.214-1.122,7.586-1.586,10.065-.196,1.049-.583,1.401-.957,1.435-.813,.075-1.43-.537-2.218-1.053-1.232-.808-1.928-1.311-3.124-2.099-1.382-.911-.486-1.412,.302-2.23,.206-.214,3.788-3.472,3.858-3.768,.009-.037,.017-.175-.065-.248-.082-.073-.203-.048-.29-.028-.124,.028-2.092,1.329-5.905,3.903-.559,.384-1.065,.571-1.518,.561-.5-.011-1.461-.283-2.176-.515-.877-.285-1.574-.436-1.513-.92,.032-.252,.379-.51,1.042-.773,4.081-1.778,6.803-2.95,8.164-3.517,3.888-1.617,4.696-1.898,5.222-1.907,.116-.002,.375,.027,.543,.163,.142,.115,.181,.27,.199,.379,.019,.109,.042,.357,.023,.551Z"
      fillRule="evenodd"
    />
  </svg>
);

const IconFacebook = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16,2c-7.732,0-14,6.268-14,14,0,6.566,4.52,12.075,10.618,13.588v-9.31h-2.887v-4.278h2.887v-1.843c0-4.765,2.156-6.974,6.835-6.974,.887,0,2.417,.174,3.043,.348v3.878c-.33-.035-.904-.052-1.617-.052-2.296,0-3.183,.87-3.183,3.13v1.513h4.573l-.786,4.278h-3.787v9.619c6.932-.837,12.304-6.74,12.304-13.897,0-7.732-6.268-14-14-14Z" />
  </svg>
);

const IconTikTok = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="35"
    height="35"
    viewBox="0 0 32 32"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="16" cy="16" r="13.7" />
    <path
      fill="#000000"
      d="M18.8 8v8.7a2.86 2.86 0 0 1-2.8 2.8 2.86 2.86 0 0 1-2.8-2.8 2.86 2.86 0 0 1 2.8-2.8c.2 0 .4 0 .6.1v-2.2c-.2 0-.4-.1-.6-.1a5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5V14.9a6.34 6.34 0 0 0 3.4 1.1v-2.3a3.57 3.57 0 0 1-2.4-.7 5.72 5.72 0 0 1-1.6-1.9l-.2-3.1Z"
    />
  </svg>
);

const IconYoutube = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M31.331,8.248c-.368-1.386-1.452-2.477-2.829-2.848-2.496-.673-12.502-.673-12.502-.673,0,0-10.007,0-12.502,.673-1.377,.37-2.461,1.462-2.829,2.848-.669,2.512-.669,7.752-.669,7.752,0,0,0,5.241,.669,7.752,.368,1.386,1.452,2.477,2.829,2.847,2.496,.673,12.502,.673,12.502,.673,0,0,10.007,0,12.502-.673,1.377-.37,2.461-1.462,2.829-2.847,.669-2.512,.669-7.752,.669-7.752,0,0,0-5.24-.669-7.752ZM12.727,20.758V11.242l8.364,4.758-8.364,4.758Z" />
  </svg>
);

const Footer = () => {
  const { language } = useI18n();

  const lang: "en" | "kh" = language === "kh" ? "kh" : "en";
  const fontClass = lang === "kh" ? "font-khmer" : "font-thicccboi";

  const t = (key: keyof typeof footerTranslation) =>
    footerTranslation[key][lang];

  const marketplaceLinks = [
    { name: t("footer.nav.home"), path: "/" },
    { name: t("footer.nav.aboutUs"), path: "/aboutUs" },
    { name: t("footer.nav.cropProduct"), path: "/listing-product" },
    { name: t("footer.nav.cropDemand"), path: "/listing-crop-demands" },
    { name: t("footer.nav.marketPrice"), path: "/market-price" },
    
  ];

  const socialLinks = [
    {
      label: t("footer.social.facebook"),
      href: "https://share.google/euQKdvH1dpWuo6Xi9",
      icon: <IconFacebook />,
    },
    {
      label: t("footer.social.tiktok"),
      href: "https://www.tiktok.com/@kshrd.center",
      icon: <IconTikTok />,
    },
    {
      label: t("footer.social.telegram"),
      href: "https://t.me/HRDCenter",
      icon: <IconTelegram />,
    },
    {
      label: t("footer.social.youtube"),
      href: "https://www.youtube.com/@KoreaSoftwareHRDCenter",
      icon: <IconYoutube />,
    },
  ];

  return (
    <footer
      className={`relative w-full lg:h-119 bg-[#1E2225] text-gray-300 pt-10 pb-6 lg:pt-18 lg:pb-6 px-6 md:px-12 overflow-hidden ${fontClass}`}
    >
      <div
        className="absolute left-0 bottom-0 w-50 h-75 lg:w-93 lg:h-117.5 opacity-40 lg:opacity-100 pointer-events-none select-none z-0 scale-x-[-1] -translate-x-12 lg:-translate-x-40 translate-y-20 lg:translate-y-17.5"
        style={{
          backgroundImage: 'url("/image/background-footer.png")',
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left bottom",
        }}
      />

      <div
        className="absolute right-0 bottom-0 w-75 h-50 lg:w-140 lg:h-85.75 opacity-40 lg:opacity-100 pointer-events-none select-none z-0 scale-y-[-1] translate-x-20 lg:translate-x-40"
        style={{
          backgroundImage: 'url("/image/background-footer-b.png")',
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right bottom",
        }}
      />

      <div className="relative z-10 max-w-325 mx-auto w-full h-full flex flex-col justify-between">
        <div className="w-full flex flex-col lg:flex-row justify-between items-center lg:items-start border-b border-gray-700/50 pb-10 lg:pb-12 mb-8 lg:mb-0">
          <div className="w-full lg:w-187.5 flex flex-col items-center lg:items-start gap-4 lg:gap-6">
            <div className="relative w-29.25 h-14">
              <Image
                src="/image/logo.png"
                alt={t("footer.brand.alt")}
                fill
                className="object-contain pointer-events-none select-none"
                priority
              />
            </div>

            <div className="w-full lg:w-187.5 h-0.5 bg-muted/30" />

            <div className="flex flex-col gap-4 text-center lg:text-left">
              <h3
                className={`text-white text-[16px] lg:text-[18px] font-semibold leading-normal lg:leading-[100%] w-full lg:w-134.25 ${fontClass}`}
              >
                {t("footer.brand.title")}
              </h3>

              <p
                className={`text-[14px] lg:text-[18px] font-semibold leading-relaxed lg:leading-[100%] text-justify w-full lg:w-187.5 ${fontClass} text-muted`}
              >
                {t("footer.brand.description")}
              </p>

              <p
                className={`text-[14px] lg:text-[18px] font-semibold leading-relaxed lg:leading-[100%] text-justify w-full lg:w-187.5 ${fontClass} text-muted`}
              >
                {t("footer.brand.mission")}
              </p>
            </div>
          </div>

          <div className="mt-10 lg:mt-0 pt-0 lg:pt-10 w-full lg:w-94 grid grid-cols-2 gap-8 lg:gap-14 justify-items-center lg:justify-items-start">
            <div className="flex flex-col gap-4 lg:gap-6">
              <h4
                className={`text-white text-[16px] lg:text-[18px] font-extrabold leading-[100%] tracking-widest uppercase ${fontClass} text-center lg:text-left`}
              >
                {t("footer.section.marketplace")}
              </h4>

              <ul className="flex flex-col gap-2 cursor-pointer lg:gap-2 text-center lg:text-left">
                {marketplaceLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className={`inline-block text-[14px] lg:text-[18px] font-semibold leading-normal lg:leading-[100%] tracking-normal text-muted hover:text-white transition-colors ${fontClass}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col justify-between gap-6 lg:gap-0 lg:h-53.5">
              <div className="flex flex-col gap-4 lg:gap-6">
                <h4
                  className={`text-white text-[16px] lg:text-[18px] font-extrabold leading-[100%] tracking-widest uppercase ${fontClass} text-center lg:text-left`}
                >
                  {t("footer.section.contactUs")}
                </h4>

                <div className="flex flex-col gap-4 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-muted"
                      aria-hidden="true"
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V8l7-4 7 4v13" />
                      <path d="M9 21v-6h6v6" />
                      <path d="M9 10h.01" />
                      <path d="M15 10h.01" />
                    </svg>

                    <p
                      className={`max-w-70 text-[14px] lg:text-[16px] font-semibold leading-relaxed text-muted ${fontClass}`}
                    >
                      {t("footer.contact.address")}
                    </p>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center lg:items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-muted"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.19 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.61a2 2 0 0 1-.45 2.11L8.09 9.59a16 16 0 0 0 6.32 6.32l1.15-1.15a2 2 0 0 1 2.11-.45c.84.3 1.71.51 2.61.63A2 2 0 0 1 22 16.92z" />
                    </svg>

                    <div
                      className={`flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-[14px] lg:text-[18px] font-semibold text-muted ${fontClass}`}
                    >
                      <Link
                        href={`tel:${t("footer.contact.phone1").replaceAll(" ", "")}`}
                        className="hover:text-white transition-colors"
                      >
                        {t("footer.contact.phone1")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-3 pt-3 text-muted">
                {socialLinks.map((social) => (
                  <Link
                    key={social.href}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors cursor-pointer duration-200"
                  >
                    {social.icon}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-4 pt-6 pb-6 border-t border-dark-grey">
          <p
            className={`text-sm md:text-base font-semibold text-center text-muted ${fontClass}`}
          >
            {t("footer.legal.copyright")}
          </p>

          <div
            className={`flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-1 text-sm md:text-base font-semibold text-muted ${fontClass}`}
          >
            <p className="hover:text-white transition-colors whitespace-nowrap">
              {t("footer.legal.privacyPolicy")}
            </p>

            <span className="text-white" aria-hidden="true">
              |
            </span>

            <p className="hover:text-white transition-colors whitespace-nowrap">
              {t("footer.legal.termsOfService")}
            </p>

            <span className="text-white" aria-hidden="true">
              |
            </span>

            <p className="hover:text-white transition-colors whitespace-nowrap">
              {t("footer.legal.trustSafety")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;