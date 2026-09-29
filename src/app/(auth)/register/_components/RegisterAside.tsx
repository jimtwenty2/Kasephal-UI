"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n/I18nContext";
import { createTranslator } from "../../login/LoginFlow";
import { REGISTER_TEXT } from "../translation";

export default function RegisterAside() {
  const { language } = useI18n();
  const t = createTranslator(REGISTER_TEXT, language);
  const fontClass = language === "kh" ? "font-khmer" : "font-thicccboi";

  return (
    <aside
      className={`relative hidden overflow-hidden ${fontClass} rounded-[clamp(16px,1.2vw,24px)] bg-[#FFF8EA] p-[clamp(20px,2.2vw,32px)] lg:block `}
    >
      <Image
        src="/assets/logo-green.png"
        alt="logo"
        width={90}
        height={40}
        className="h-auto w-[clamp(70px,6vw,90px)]"
      />

      <div className="mt-[clamp(32px,4vw,64px)]">
        <h1 className="max-w-[clamp(260px,22vw,340px)] text-[clamp(28px,2.6vw,42px)] font-extrabold leading-[1.1] text-primary-heading">
          {t("register.hero.title")}
        </h1>

        <p className="mt-[clamp(10px,1vw,16px)] max-w-[clamp(260px,22vw,340px)] text-[clamp(14px,1.1vw,18px)] leading-6 text-description-text">
          {t("register.hero.description")}
        </p>
      </div>

      <Image
        src="/assets/farmer-register.png"
        alt="Farmer Register"
        width={500}
        height={600}
        className="absolute bottom-0 left-0 w-full object-contain"
        priority
      />
    </aside>
  );
}