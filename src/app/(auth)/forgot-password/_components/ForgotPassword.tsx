"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from "@/schema/forgot-password.schema";
import { forgotPasswordInitiateAction } from "@/action/auth/forgot-password.action";
import { pushToast } from "@/lib/toastStore";
import { maskIdentifier } from "@/utils/maskIdentifier";
import { FORGOT_PASSWORD_TEXT } from "./ForgotPasswordPageClient";
import { createTranslator } from "../../login/LoginFlow";
type Props = {
  language: string;
  onSendCode: (identifier: string) => void;
  onTryAnotherWay: () => void;
};

export default function ForgotPassword({
  language,
  onSendCode,
  onTryAnotherWay,
}: Props) {
  const [loading, setLoading] = useState(false);
  const t = createTranslator(FORGOT_PASSWORD_TEXT, language);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    const result = await forgotPasswordInitiateAction(data.email);

    setLoading(false);

    if (!result.success) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof ForgotPasswordFormData, {
          type: "server",
          message,
        });
      });
      pushToast({
        title: t("forgotPassword.toast.senCodeFailed"),
        message: result.error,
        variant: "error",
      });
      return;
    }
    pushToast({
      title: t("forgotPassword.toast.otpSent"),
      message: `${t("forgotPassword.toast.verificationSent")} ${maskIdentifier(data.email)}.`,
      variant: "success",
    });
    onSendCode(data.email);
  };

  return (
    <section className="w-full max-w-115">
      <Link
        href="/login"
        className="mb-10 flex w-fit items-center gap-1 text-[13px] font-medium text-[#374151] transition hover:text-primary md:mb-14"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        {t("forgotPassword.common.back")}
      </Link>

      <h1 className="text-[clamp(34px,3.1vw,58px)] font-bold leading-tight text-primary-heading sm:text-[30px]">
        {t("forgotPassword.email.title")}
      </h1>

      <p className="mt-4 max-w-105 text-[clamp(13px,0.95vw,17px)]] leading-[1.4] text-description-text sm:text-[15px]">
        {t("forgotPassword.email.description")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <label className="text-[clamp(13px,0.95vw,17px)] font-bold text-primary">
          <span className="text-red-500">*</span>{" "}
          {t("forgotPassword.common.email")}
        </label>

        <input
          type="email"
          placeholder={t("forgotPassword.common.emailPlaceholder")}
          {...register("email")}
          className="mt-2 h-12 w-full rounded-[10px] border border-light-grey bg-transparent px-4 text-[14px] text-[#252B37] outline-none transition placeholder:text-[#8B95A1] focus:border-primary"
        />

        {errors.email && (
          <p className="mt-1 text-[12px] text-red-500">
            {errors.email.message}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onTryAnotherWay}
            className="relative w-fit text-[14px] cursor-pointer font-medium text-primary after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100"
          >
            {t("forgotPassword.common.tryAnotherWay")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-12 flex  cursor-pointer justify-center items-center rounded-[10px] bg-secondary px-8 text-[clamp(15px,1.05vw,19px)] font-semibold transition hover:bg-amber-500 hover:text-white sm:px-10"
          >
            {t("forgotPassword.common.sendCode")}
          </button>
        </div>
      </form>
    </section>
  );
}
