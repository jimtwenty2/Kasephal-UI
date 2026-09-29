"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { forgotPasswordInitiateAction } from "@/action/auth/forgot-password.action";
import { pushToast } from "@/lib/toastStore";
import { maskIdentifier } from "@/utils/maskIdentifier";
import { FORGOT_PASSWORD_TEXT } from "./ForgotPasswordPageClient";
import { createTranslator } from "../../login/LoginFlow";

const schema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
});

type FormData = z.infer<typeof schema>;

type Props = {
  language: string;
  onBack: () => void;
  onSendCode: (phoneNumber: string) => void;
  onTryAnotherWay: () => void;
};

export default function AccountRecovery({
  language,
  onBack,
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    if (loading) return;

    setLoading(true);
    let phoneNumber = values.phoneNumber?.trim();

    if (phoneNumber) {
      phoneNumber =
        phoneNumber.charAt(0) === "0" ? phoneNumber : "0" + phoneNumber;
    }

    if (!phoneNumber) {
      setLoading(false);
      return;
    }

    const result = await forgotPasswordInitiateAction(phoneNumber);

    setLoading(false);

    if (!result.success) {
      Object.entries(result.fieldErrors ?? {}).forEach(([field, message]) => {
        setError(field as keyof FormData, {
          type: "server",
          message,
        });
      });
      pushToast({
        title: t("forgotPassword.toast.sendCodeFailed"),
        message: result.error,
        variant: "error",
      });
      return;
    }

    pushToast({
      title: t("forgotPassword.toast.otpSent"),
      message: `${t("forgotPassword.toast.verificationSent")} ${maskIdentifier(
        phoneNumber,
      )}.`,
      variant: "success",
    });

    onSendCode(phoneNumber);
  };

  return (
    <section className="w-full max-w-115">
      <button
        type="button"
        onClick={onBack}
        className="mb-10 flex w-fit items-center gap-1 text-[13px] font-medium text-[#374151] transition hover:text-primary md:mb-14"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        {t("forgotPassword.common.back")}
      </button>

      <h1 className="text-[26px] font-bold text-[#252B37] sm:text-[30px]">
        {t("forgotPassword.accountRecovery.title")}
      </h1>

      <p className="mt-4 max-w-105 text-[14px] leading-[1.4] text-[#5E6873] sm:text-[15px]">
        {t("forgotPassword.accountRecovery.description")} 098••••18
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
        <label className="mb-2 block text-[14px] font-bold text-primary">
          <span className="mr-1 text-red-500">*</span>
          {t("forgotPassword.common.phoneNumber")}
        </label>

        <div className="flex h-12 items-center rounded-[10px] border border-[#D9DEE5] px-3 focus-within:border-primary">
          <div className="mr-3 flex items-center gap-2 border-r border-[#E5E7EB] pr-3">
            <Image
              src="/assets/kh-flag.png"
              alt="Cambodia flag"
              width={20}
              height={20}
              className="h-5 w-6 object-cover"
            />

            <span className="text-sm font-medium text-[#34383D]">(+855)</span>
          </div>

          <input
            {...register("phoneNumber")}
            type="text"
            inputMode="numeric"
            placeholder="--- --- ---"
            className="w-full bg-transparent text-sm text-[#34383D] outline-none placeholder:text-[#9CA3AF]"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
            }}
          />
        </div>

        {errors.phoneNumber && (
          <p className="mt-2 text-sm text-red-500">
            {errors.phoneNumber.message}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onTryAnotherWay}
            className="relative text-[14px] font-medium text-primary after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:w-full after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:after:scale-x-100"
          >
            {t("forgotPassword.common.tryAnotherWay")}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="h-12 cursor-pointer rounded-[10px] bg-secondary px-8 text-[13px] font-bold text-[#252B37] transition hover:bg-amber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? t("forgotPassword.common.sending")
              : t("forgotPassword.common.sendCode")}
          </button>
        </div>
      </form>
    </section>
  );
}
