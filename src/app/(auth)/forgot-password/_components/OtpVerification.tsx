"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

import { pushToast } from "@/lib/toastStore";
import { resendOtpAction } from "@/action/auth/otp.action";
import { verifyForgotPasswordOtpAction } from "@/action/auth/forgot-password.action";
import { maskIdentifier } from "@/utils/maskIdentifier";

import { OtpSchema, otpSchema } from "@/schema/otp.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FORGOT_PASSWORD_TEXT } from "./ForgotPasswordPageClient";
import { createTranslator } from "../../login/LoginFlow";

type Props = {
  language: string;
  identifier: string;
  onBack: () => void;
  onVerify: () => void;
};

export default function OtpVerification({
  language,
  identifier,
  onBack,
  onVerify,
}: Props) {
  const t = createTranslator(FORGOT_PASSWORD_TEXT, language);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(59);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<OtpSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const onSubmit = async (values: OtpSchema) => {
    if (loading) return;

    setLoading(true);

    const result = await verifyForgotPasswordOtpAction(values, identifier);

    setLoading(false);

    if (!result.success) {
      pushToast({
        title: t("forgotPassword.otp.failedTitle"),
        message: result.error,
        variant: "error",
      });
      return;
    }

    pushToast({
      title: t("forgotPassword.otp.successTitle"),
      message: t("forgotPassword.otp.successMessage"),
      variant: "success",
    });

    onVerify();
  };

  const submitOtp = handleSubmit(onSubmit);

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    clearErrors("otp");

    const newOtp = [...otpValues];
    newOtp[index] = value;

    setOtpValues(newOtp);

    const otp = newOtp.join("");

    setValue("otp", otp, {
      shouldValidate: false,
    });

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && otp.length === 6) {
      setTimeout(() => submitOtp(), 100);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0 || loading) return;

    const result = await resendOtpAction(identifier);

    if (!result.success) {
      pushToast({
        title: t("forgotPassword.otp.resendFailedTitle"),
        message: result.error,
        variant: "error",
      });
      return;
    }

    pushToast({
      title: t("forgotPassword.otp.resendSuccessTitle"),
      message: `${t(
        "forgotPassword.otp.resendSuccessMessage",
      )} ${maskIdentifier(identifier)}.`,
      variant: "success",
    });

    setOtpValues(["", "", "", "", "", ""]);
    setValue("otp", "");
    setTimeLeft(59);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const isDisabled = loading;
  return (
    <form
      onSubmit={submitOtp}
      className="mx-auto w-full max-w-107.5 px-4 sm:px-0"
    >
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="mb-10 flex items-center gap-1 text-[13px] text-description-text transition hover:text-primary"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        {t("forgotPassword.common.back")}
      </button>

      {/* Title */}
      <h1 className="text-[30px] font-bold text-heading-text">
        {t("forgotPassword.otp.title")}
      </h1>

      {/* Description */}
      <p className="mt-4 text-[clamp(13px,0.95vw,17px)] text-description-text">
        {t("forgotPassword.otp.description")}{" "}
        {maskIdentifier(identifier)}.
      </p>

      {/* OTP Inputs */}
      <div className="mt-8 flex justify-between gap-3">
        {otpValues.map((value, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value}
            disabled={isDisabled}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="h-13 w-13 rounded-[10px] border border-light-grey text-center text-lg font-bold text-primary outline-none transition focus:border-primary disabled:opacity-60"
          />
        ))}
      </div>

      {/* Error */}
      {errors.otp?.message && (
        <p className="mt-3 text-center text-sm text-red-500">
          {errors.otp.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isDisabled}
        className="mt-8 h-11 w-full cursor-pointer rounded-[9px] bg-secondary text-[clamp(15px,1.05vw,19px)] font-semibold text-heading-text transition hover:bg-amber-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? t("forgotPassword.otp.verifying")
          : t("forgotPassword.otp.verifyCode")}
      </button>

      {/* Timer */}
      <p className="mt-8 text-center text-sm text-description-text">
        {t("forgotPassword.otp.resendIn")} {formattedTime}
      </p>

      {/* Resend */}
      <p className="mt-8 text-center text-sm text-description-text">
        {t("forgotPassword.otp.didNotReceive")}{" "}
        <button
          type="button"
          disabled={timeLeft > 0 || loading}
          onClick={handleResendCode}
          className={`font-semibold transition ${
            timeLeft > 0 || loading
              ? "cursor-not-allowed text-gray-400"
              : "text-primary hover:underline"
          }`}
        >
          {t("forgotPassword.otp.resendCode")}
        </button>
      </p>
    </form>
  );
}