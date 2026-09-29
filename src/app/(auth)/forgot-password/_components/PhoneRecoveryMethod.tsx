"use client";

import {
  ChatBubbleLeftEllipsisIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/solid";
import { FORGOT_PASSWORD_TEXT } from "./ForgotPasswordPageClient";
import { createTranslator } from "../../login/LoginFlow";

type Props = {
  language: string;
  onBack?: () => void;
  onSendCode?: () => void;
  onTryAnotherWay?: () => void;
};

export default function PhoneRecoveryMethod({
  language,
  onBack,
  onSendCode,
  onTryAnotherWay,
}: Props) {
  const t = createTranslator(FORGOT_PASSWORD_TEXT, language);

  return (
    <div className="flex min-h-screen w-full items-start justify-center bg-white px-6 py-6">
      <div className="w-full max-w-152.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] font-medium text-[#3F464B] hover:text-primary"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {t("forgotPassword.common.back")}
        </button>

        <div className="mx-auto mt-16 w-full max-w-107.5">
          <h1 className="text-[clamp(24px,2.5vw,32px)] font-bold leading-tight text-[#23272A]">
            {t("forgotPassword.phoneMethod.title")}
          </h1>

          <p className="mt-5 text-[15px] leading-[1.35] text-[#5F666D]">
            {t("forgotPassword.phoneMethod.description")}
          </p>

          <p className="mt-10 text-[15px] text-[#4F565C]">
            {t("forgotPassword.phoneMethod.chooseMethod")}
          </p>

          <button
            type="button"
            onClick={onSendCode}
            className="mt-5 flex w-full cursor-pointer items-center gap-3 border-b border-[#AEB6BC] pb-4 text-left text-[15px] font-semibold text-[#33383D]"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-[5px] bg-primary text-white">
              <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
            </span>
            <span>098••••18</span>
          </button>

          <button
            type="button"
            onClick={onTryAnotherWay}
            className="flex w-full items-center gap-3 border-b border-[#AEB6BC] py-4 text-left text-[15px] font-medium text-[#4A5157] hover:text-primary"
          >
            <span className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[5px] bg-primary text-white">
              <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5" />
            </span>
            <span>{t("forgotPassword.common.tryAnotherWay")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
