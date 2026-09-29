"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { otpSchema, OtpSchema } from "@/schema/otp.schema";
import { resendOtpAction, verifyOtpAction } from "@/action/auth/otp.action";
import FormHeader from "./FormHeader";
import SubmitButton from "./SubmitButton";
import { pushToast } from "@/lib/toastStore";
import { maskIdentifier } from "@/utils/maskIdentifier";
import { REGISTER_TEXT } from "../translation";
import { createTranslator } from "../../login/LoginFlow";

type Props = {
  language: string;
  identifier: string;
  onNext: () => void;
  onProfileToken?: (token: string) => void;
};

export default function OtpForm({
  language,
  identifier,
  onNext,
  onProfileToken,
}: Props) {
  const t = createTranslator(REGISTER_TEXT, language);

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

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedValue.split("").forEach((char, index) => {
      newOtp[index] = char;
    });

    setOtpValues(newOtp);

    setValue("otp", newOtp.join(""), {
      shouldValidate: false,
    });

    inputRefs.current[Math.min(pastedValue.length, 6) - 1]?.focus();
  };

  const onSubmit = async (values: OtpSchema) => {
    if (loading) return;

    setLoading(true);

    const result = await verifyOtpAction(values, identifier);

    setLoading(false);

    if (!result.success) {
      pushToast({
        title: t("register.otp.failed"),
        message: result.error,
        variant: "error",
      });
      return;
    }

    pushToast({
      title: t("register.otp.success"),
      message: t("register.otp.successMessage"),
      variant: "success",
    });

    onProfileToken?.(result.profileSetupToken);
    onNext();
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
      setTimeout(() => {
        submitOtp();
      }, 100);
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
    if (timeLeft > 0) return;

    const result = await resendOtpAction(identifier);

    if (!result.success) {
      pushToast({
        title: t("register.otp.resendFailed"),
        message: result.error,
        variant: "error",
      });
      return;
    }

    pushToast({
      title: t("register.otp.sent"),
      message: `${t("register.otp.sentMessage")} ${maskIdentifier(identifier)}.`,
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

  return (
    <form
      onSubmit={submitOtp}
      className="mx-auto flex w-full max-w-md flex-col px-3 sm:px-0"
    >
      <FormHeader
        title={t("register.otp.title")}
        description={`${t("register.otp.description")} ${maskIdentifier(
          identifier,
        )}.`}
      />

      <div className="mt-6 flex justify-center gap-2 sm:mt-8 sm:gap-3">
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
            disabled={loading}
            onPaste={handlePaste}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="
              h-11 w-11 rounded-xl
              border
              border-light-grey
              text-center
              text-base
              font-bold
              text-primary
              outline-none
              transition
              focus:border-primary
              focus:ring-2
              focus:ring-primary/20
              disabled:opacity-60
              sm:h-12
              sm:w-12
              sm:text-lg
              md:h-13
              md:w-13
            "
          />
        ))}
      </div>

      {errors.otp && (
        <p className="mt-3 text-center text-sm text-red-500">
          {errors.otp.message}
        </p>
      )}

      <SubmitButton disabled={loading}>
        {loading ? t("register.otp.verifying") : t("register.otp.verify")}
      </SubmitButton>

      <p className="mt-6 text-center text-sm text-description sm:mt-8">
        {t("register.otp.resendIn")} {formattedTime}
      </p>

      <p className="mt-4 text-center text-sm text-description sm:mt-6">
        {t("register.otp.notReceived")}{" "}
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
          {t("register.otp.resend")}
        </button>
      </p>
    </form>
  );
}
