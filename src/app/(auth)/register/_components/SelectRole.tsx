"use client";

import Image from "next/image";

import { Role } from "./RegisterClient";
import { createTranslator } from "../../login/LoginFlow";
import { REGISTER_TEXT } from "../translation";

type Props = {
  language: string;
  onSelectRole: (role: Role) => void;
};

export default function SelectRole({
  language,
  onSelectRole,
}: Props) {
  const t = createTranslator(REGISTER_TEXT, language);

  return (
    <div className="h-full w-full max-w-150 p-5">
      <h1 className="text-[24px] font-bold text-heading sm:text-[28px] md:text-[32px]">
        {t("register.selectRole.title1")}{" "}
        <span className="text-primary">
          {t("register.selectRole.title2")}
        </span>
      </h1>

      <p className="mt-3 text-[13px] leading-6 text-description-text sm:text-sm md:text-[15px]">
        {t("register.selectRole.description")}
      </p>

      <div className="mt-20 space-y-4 sm:mt-8">
        <button
          type="button"
          onClick={() => onSelectRole("FARMER")}
          className="w-full rounded-4xl border border-light-grey p-4 text-left transition duration-400 hover:scale-[1.01] hover:border-secondary hover:bg-background sm:rounded-[20px] sm:p-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#1E1E1E] sm:h-15 sm:w-15 sm:rounded-3xl">
              <Image
                src="/assets/farmer-icon.png"
                alt="farmer"
                width={60}
                height={60}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h2 className="text-[17px] font-bold text-heading-text sm:text-[20px]">
                {t("register.selectRole.farmer.title")}
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-description-text sm:text-[15px]">
                {t("register.selectRole.farmer.description")}
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelectRole("BUYER")}
          className="w-full rounded-4xl border border-light-grey bg-white p-4 text-left transition duration-400 hover:scale-[1.01] hover:border-secondary hover:bg-background sm:rounded-[18px] sm:p-5"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[#1E1E1E] sm:h-15 sm:w-15 sm:rounded-3xl">
              <Image
                src="/assets/buyer-icon.png"
                alt="buyer"
                width={60}
                height={60}
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h2 className="text-[17px] font-bold text-heading-text sm:text-[20px]">
                {t("register.selectRole.buyer.title")}
              </h2>

              <p className="mt-1 text-[13px] leading-5 text-description-text sm:text-[15px]">
                {t("register.selectRole.buyer.description")}
              </p>
            </div>
          </div>
        </button>

        <div className="mt-8 flex justify-center text-[13px] text-description-text sm:mt-10 sm:text-[15px]">
          <p>
            {t("register.selectRole.haveAccount")}{" "}
            <a
              href="/login"
              className="cursor-pointer font-bold text-primary hover:underline"
            >
              {t("register.selectRole.login")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}