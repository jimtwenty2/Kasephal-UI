"use client";

import Image from "next/image";

type LanguageButtonProps = {
  language: "en" | "kh";
  onSwitch: () => void;
};

export default function LanguageButton({
  language,
  onSwitch,
}: LanguageButtonProps) {
  return (
    <button
      type="button"
      onClick={onSwitch}
      className="w-17 h-10 rounded-xl bg-white/90 flex items-center justify-center gap-1 text-[14px] font-semibold text-[#3A3A3A] cursor-pointer"
    >
      <Image
        src={
          language === "en"
            ? "/assets/nav-bar/EN_image.png"
            : "/assets/nav-bar/KH_image.png"
        }
        alt="Language"
        width={18}
        height={18}
      />

      <span>{language === "en" ? "EN" : "KH"}</span>
    </button>
  );
}
